import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalContent: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    summaryType: {
      type: String,
      enum: ['extractive', 'abstractive'],
      required: true,
    },
    summaryLength: {
      type: String,
      enum: ['short', 'medium', 'detailed'],
      default: 'medium',
    },
    wordCount: {
      type: Number,
      required: true,
    },
    processingTime: {
      type: String,
      required: true,
    },
    chatHistory: [
      {
        role: {
          type: String,
          enum: ['user', 'model'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Summary = mongoose.model('Summary', summarySchema);
export default Summary;
