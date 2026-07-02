const mongoose = require('mongoose');
const { getModel } = require('./dbWrapper');

const glossarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    sourceTerm: {
      type: String,
      required: [true, 'Source term is required'],
      trim: true,
    },
    targetTerm: {
      type: String,
      required: [true, 'Target term is required'],
      trim: true,
    },
    domain: {
      type: String,
      default: 'General',
      trim: true,
    },
    sourceLanguage: {
      type: String,
      default: 'English',
      trim: true,
    },
    targetLanguage: {
      type: String,
      default: 'Vietnamese',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

glossarySchema.index({ userId: 1, domain: 1 });

const GlossaryModel = mongoose.model('Glossary', glossarySchema);
module.exports = getModel('Glossary', GlossaryModel);

