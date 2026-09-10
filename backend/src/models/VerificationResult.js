// VerificationResult.js
// Mongoose model for storing email verification results
// Stores all verification data for history tracking and analytics
// Indexed by timestamp for efficient querying of recent verifications

import mongoose from 'mongoose';

const verificationResultSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true 
  },
  result: { 
    type: String, 
    enum: ['valid', 'invalid', 'unknown'],
    required: true 
  },
  resultcode: { 
    type: Number,
    required: true 
  },
  subresult: { 
    type: String 
  },
  domain: { 
    type: String 
  },
  mxRecords: [{ 
    type: String 
  }],
  disposable: { 
    type: Boolean, 
    default: false 
  },
  emailProvider: {
    type: Object,
    default: null
  },
  didyoumean: {
    type: Object,
    default: null
  },
  executiontime: { 
    type: Number 
  },
  error: { 
    type: String, 
    default: null 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Index for efficient querying
verificationResultSchema.index({ timestamp: -1 });
verificationResultSchema.index({ email: 1, timestamp: -1 });

export default mongoose.model('VerificationResult', verificationResultSchema);
