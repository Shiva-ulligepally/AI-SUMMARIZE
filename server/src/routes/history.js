import express from 'express';
import { protect } from '../middleware/auth.js';
import Summary from '../models/Summary.js';

const router = express.Router();

/**
 * @route   GET /api/history
 * @desc    Get all summaries for the current logged-in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    // Return all user summaries, sorting by newest first
    // Omit originalContent in list view to save network overhead, but keep key metadata
    const summaries = await Summary.find({ userId: req.user._id })
      .select('-originalContent') 
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: summaries.length,
      data: summaries,
    });
  } catch (error) {
    console.error('Fetch history error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   GET /api/history/:id
 * @desc    Get a single summary's complete details (including chat history & original content)
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const summary = await Summary.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!summary) {
      return res.status(404).json({ success: false, error: 'Summary history record not found' });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Fetch single summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   DELETE /api/history/:id
 * @desc    Delete a specific summary history record
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const summary = await Summary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!summary) {
      return res.status(404).json({ success: false, error: 'Summary record not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Summary record deleted successfully',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('Delete summary error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
