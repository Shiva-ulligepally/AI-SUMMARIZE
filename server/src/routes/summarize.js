import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import Summary from '../models/Summary.js';
import { summarizeExtractive } from '../utils/extractive.js';
import { summarizeAbstractive, chatWithAI } from '../utils/ai.js';
import { parsePDF, parseDOCX } from '../utils/fileParser.js';

const router = express.Router();

// Multer memory-storage configuration to avoid saving files on serverless disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'text/plain',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are supported.'));
    }
  },
});

/**
 * Helper to calculate word count
 */
const countWords = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Helper to truncate title
 */
const makeTitle = (text, defaultTitle = 'Pasted Text Summary') => {
  if (!text) return defaultTitle;
  const words = text.trim().split(/\s+/).slice(0, 5).join(' ');
  return words.length < 50 ? `${words}...` : `${words.substring(0, 47)}...`;
};

/**
 * @route   POST /api/summarize/text
 * @desc    Summarize a raw block of text
 * @access  Private
 */
router.post('/text', protect, async (req, res) => {
  try {
    const { content, summaryType, summaryLength } = req.body;

    // Validation
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, error: 'Empty content. Please provide text to summarize.' });
    }

    if (!['extractive', 'abstractive'].includes(summaryType)) {
      return res.status(400).json({ success: false, error: 'Invalid summaryType. Must be extractive or abstractive.' });
    }

    const lengthVal = summaryLength || 'medium';
    if (!['short', 'medium', 'detailed'].includes(lengthVal)) {
      return res.status(400).json({ success: false, error: 'Invalid summaryLength. Must be short, medium, or detailed.' });
    }

    const startTime = Date.now();
    let summaryResult = '';

    if (summaryType === 'extractive') {
      summaryResult = summarizeExtractive(content, lengthVal);
    } else {
      summaryResult = await summarizeAbstractive(content, lengthVal);
    }

    const durationMs = Date.now() - startTime;
    const processingTime = `${(durationMs / 1000).toFixed(1)}s`;
    const finalWordCount = countWords(summaryResult);
    const titleVal = makeTitle(content, 'Text Input Summary');

    // Save summary history record to database
    const summaryRecord = await Summary.create({
      userId: req.user._id,
      title: titleVal,
      originalContent: content,
      summary: summaryResult,
      summaryType,
      summaryLength: lengthVal,
      wordCount: finalWordCount,
      processingTime,
      chatHistory: [],
    });

    res.json({
      success: true,
      summaryType,
      summary: summaryResult,
      wordCount: finalWordCount,
      processingTime,
      id: summaryRecord._id,
    });
  } catch (error) {
    console.error('Text summarization route error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/summarize/file
 * @desc    Upload a PDF/DOCX/TXT file and summarize it
 * @access  Private
 */
router.post('/file', protect, upload.single('file'), async (req, res) => {
  try {
    const { summaryType, summaryLength } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'Please upload a valid file.' });
    }

    if (!['extractive', 'abstractive'].includes(summaryType)) {
      return res.status(400).json({ success: false, error: 'Invalid summaryType. Must be extractive or abstractive.' });
    }

    const lengthVal = summaryLength || 'medium';

    let extractedText = '';

    // Extract text from the binary file based on mimetype
    if (file.mimetype === 'application/pdf') {
      extractedText = await parsePDF(file.buffer);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await parseDOCX(file.buffer);
    } else if (file.mimetype === 'text/plain') {
      extractedText = file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ success: false, error: 'Could not extract text from the file.' });
    }

    const startTime = Date.now();
    let summaryResult = '';

    if (summaryType === 'extractive') {
      summaryResult = summarizeExtractive(extractedText, lengthVal);
    } else {
      summaryResult = await summarizeAbstractive(extractedText, lengthVal);
    }

    const durationMs = Date.now() - startTime;
    const processingTime = `${(durationMs / 1000).toFixed(1)}s`;
    const finalWordCount = countWords(summaryResult);

    // Save summary record using original file name as the title
    const summaryRecord = await Summary.create({
      userId: req.user._id,
      title: file.originalname,
      originalContent: extractedText,
      summary: summaryResult,
      summaryType,
      summaryLength: lengthVal,
      wordCount: finalWordCount,
      processingTime,
      chatHistory: [],
    });

    res.json({
      success: true,
      summaryType,
      summary: summaryResult,
      wordCount: finalWordCount,
      processingTime,
      id: summaryRecord._id,
    });
  } catch (error) {
    console.error('File summarization route error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/summarize/:id/chat
 * @desc    Ask follow-up downstream questions on an existing summary
 * @access  Private
 */
router.post('/:id/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const summaryId = req.params.id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Please enter a chat message.' });
    }

    const summaryRecord = await Summary.findOne({ _id: summaryId, userId: req.user._id });
    if (!summaryRecord) {
      return res.status(404).json({ success: false, error: 'Summary history log not found.' });
    }

    // Call conversational helper to interface with LLM
    const aiResponse = await chatWithAI(
      summaryRecord.originalContent,
      summaryRecord.summary,
      summaryRecord.chatHistory,
      message
    );

    // Update conversation state in DB
    summaryRecord.chatHistory.push({ role: 'user', content: message });
    summaryRecord.chatHistory.push({ role: 'model', content: aiResponse });
    await summaryRecord.save();

    res.json({
      success: true,
      userMessage: message,
      aiResponse,
      chatHistory: summaryRecord.chatHistory,
    });
  } catch (error) {
    console.error('Summary conversational chat route error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
