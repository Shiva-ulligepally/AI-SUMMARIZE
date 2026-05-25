import pdf from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from PDF file buffer
 */
export const parsePDF = async (fileBuffer) => {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  }
};

/**
 * Extracts raw text from DOCX file buffer
 */
export const parseDOCX = async (fileBuffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error.message);
    throw new Error(`Failed to parse DOCX file: ${error.message}`);
  }
};
