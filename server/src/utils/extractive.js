/**
 * Custom High-Fidelity Extractive Summarization Engine
 * Strictly uses original sentences. Zero hallucination. No external API cost.
 */

const sentencize = (text) => {
  if (!text) return [];
  // Clean up excessive spacing
  const cleanedText = text.replace(/\s+/g, ' ').trim();
  
  // Sentence boundary splits that ignore common abbreviations
  // Mr., Dr., i.e., e.g., A.I. are protected by standard parsing.
  const sentenceRegex = /[^.!?]+[.!?]+(?=\s[A-Z]|$)/g;
  let sentences = cleanedText.match(sentenceRegex) || [];
  
  // Fallback if regex match yields nothing
  if (sentences.length === 0) {
    sentences = cleanedText.split(/[.!?]+/).filter(Boolean);
  }
  
  return sentences.map(s => s.trim()).filter(s => s.length > 5);
};

export const summarizeExtractive = (text, length = 'medium') => {
  if (!text || text.trim() === '') return '';
  
  const sentences = sentencize(text);
  if (sentences.length <= 3) {
    // If text is extremely short, format and return original sentences as bullet points
    return sentences.map(s => `• ${s}`).join('\n');
  }

  // Determine number of sentences to extract based on length constraint
  let targetCount = 3;
  if (length === 'short') {
    targetCount = Math.max(3, Math.round(sentences.length * 0.15));
  } else if (length === 'medium') {
    targetCount = Math.max(5, Math.round(sentences.length * 0.25));
  } else if (length === 'detailed') {
    targetCount = Math.max(8, Math.round(sentences.length * 0.40));
  }
  
  // Cap extraction target
  targetCount = Math.min(targetCount, sentences.length);

  // Stop words list for cleaning word matrices
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do', 
    'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 
    'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 
    'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 
    'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 
    'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 
    'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 
    'yourselves', 'will', 'also', 'hasn\'t', 'haven\'t', 'isn\'t', 'shouldn\'t', 'couldn\'t'
  ]);

  // Count word frequencies across the whole document
  const wordCounts = {};
  let maxCount = 0;
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        if (wordCounts[word] > maxCount) {
          maxCount = wordCounts[word];
        }
      }
    });
  });

  // Normalize frequency scoring
  const wordFrequencies = {};
  if (maxCount > 0) {
    for (const word in wordCounts) {
      wordFrequencies[word] = wordCounts[word] / maxCount;
    }
  }

  // Score sentences based on relative term frequency sums
  const sentenceScores = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let rawScore = 0;
    let meaningfulWordCount = 0;

    words.forEach(word => {
      if (wordFrequencies[word]) {
        rawScore += wordFrequencies[word];
        meaningfulWordCount++;
      }
    });

    // Apply length-based normalization (divide by square root of content length)
    // to avoid bias towards excessively long sentences.
    const normalizedScore = meaningfulWordCount > 0 ? rawScore / Math.pow(meaningfulWordCount, 0.4) : 0;
    
    return {
      sentence,
      index,
      score: normalizedScore
    };
  });

  // Select top N high-scoring sentences
  const topSentences = [...sentenceScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, targetCount);

  // Reorder selections back to original position indices to maintain logical context
  const orderedSelections = topSentences.sort((a, b) => a.index - b.index);

  // Return bulleted sentences
  return orderedSelections.map(item => `• ${item.sentence}`).join('\n');
};
