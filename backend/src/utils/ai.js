import Groq from 'groq-sdk';

// Initialize Grok API client if key exists
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    console.warn('WARNING: GROQ_API is missing or unconfigured in server .env. AI features will run in Demo Fallback Mode.');
    return null;
  }
  try {
    return new Groq({
      apiKey: apiKey
    });
  } catch (err) {
    console.error('Error initializing Groq SDK:', err.message);
    return null;
  }
};

/**
 * AI Abstractive Summarizer: Explains content in simple, human-like language
 */
export const summarizeAbstractive = async (text, length = 'medium') => {
  const groq = getGroqClient();
  
  if (!groq) {
    // Graceful Demo Fallback if API key is not configured yet
    return `[DEMO MODE: GROQ_API is not configured in the server/.env file. Below is a mock AI summary based on the text length requested.]\n\n` + 
      `This document discusses the primary core themes of your submitted content. If you configure a valid Grok API Key in the server .env file, this abstractive AI summary will use deep natural language generation to rewrite your content into extremely easy-to-read, conversational language with real-world analogies.\n\n` +
      `Here is a quick summary breakdown:\n` +
      `- Length Setting: ${length.toUpperCase()}\n` +
      `- Content characters received: ${text.length} chars\n` +
      `- Factual highlight: The text highlights essential operations, focusing on productivity and efficiency. Under proper AI mode, this explanation will simplify all complex technical jargons seamlessly.`;
  }

  // Define target lengths instructions
  let lengthPrompt = '';
  if (length === 'short') {
    lengthPrompt = 'Explain the content very briefly in 1 to 2 short paragraphs (maximum 150 words). Focus only on the core idea.';
  } else if (length === 'medium') {
    lengthPrompt = 'Explain the content in a highly understandable format, using 2 to 3 friendly paragraphs (about 250-300 words). Use simple vocabulary.';
  } else if (length === 'detailed') {
    lengthPrompt = 'Provide a thorough, comprehensive section-by-section breakdown of the content. Summarize each major theme in separate, simplified paragraphs. Maintain detail while using very simple language. Length can be up to 500 words.';
  }

  const systemInstruction = 
    `You are SmartSumm AI, a premium AI Summarizer and UX/UI micro-writer. Your job is to read the provided text and explain it in extremely simple, beginner-friendly, conversational language.
    Follow these strict rules:
    1. Translate all complex technical jargons, academic concepts, or dense business language into simple vocabulary that an average 12-year-old can easily understand.
    2. Add short, real-world analogies or examples to explain hard topics where helpful.
    3. Output the summary in rich, human-readable markdown paragraphs.
    4. Do NOT use bullet points (bullet points are reserved for extractive mode). Use paragraphs and bold headers if needed.
    5. Length constraint: ${lengthPrompt}`;

  try {
    const prompt = `${systemInstruction}\n\nHere is the original text to summarize:\n${text}`;
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024
    });
    return message.choices[0].message.content;
  } catch (error) {
    console.error('Grok API call failed:', error.message);
    throw new Error(`AI Summarization failed: ${error.message}`)
  }
};

/**
 * AI Chat Handler: Responds to downstream follow-up queries inside the context of the summary
 */
export const chatWithAI = async (originalContent, summaryContext, chatHistory, userQuestion) => {
  const groq = getGroqClient();

  if (!groq) {
    return `[DEMO MODE: Chat is inactive because GROQ_API is not configured in server/.env.]\n\nYou asked: "${userQuestion}"\n\nTo interact and chat with your documents, please get a free Grok API Key from Groq, insert it in the server's .env file, and restart the server!`;
  }

  // Re-map chat history to Grok's expected format
  const formattedHistory = chatHistory.map(h => 
    `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
  ).join('\n');

  const prompt = 
    `You are the SmartSumm AI assistant. You are helping the user understand a document they uploaded.
    Here is the ORIGINAL TEXT of the document:
    ---------------------------------
    ${originalContent}
    ---------------------------------
    
    Here is the GENERATED SUMMARY:
    ---------------------------------
    ${summaryContext}
    ---------------------------------

    Previous Conversation Logs:
    ${formattedHistory}

    User's New Question:
    "${userQuestion}"

    Task:
    Answer the user's question simply, in a conversational, helpful, and friendly manner. 
    Use the original text and generated summary as your primary context. 
    If the user asks to "Explain more", "Simplify this", "Give key points", or "Explain like a beginner", tailor your response exactly to that request.
    Keep the response concise, engaging, and directly helpful.`;

  try {
    const message = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024
    });
    return message.choices[0].message.content;
  } catch (error) {
    console.error('Grok Chat API call failed:', error.message);
    throw new Error(`AI Chat failed: ${error.message}`)
  }
};
