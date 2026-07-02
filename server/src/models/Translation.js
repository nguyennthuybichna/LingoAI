const mongoose = require('mongoose');
const { getModel } = require('./dbWrapper');

const translationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    originalText: {
      type: String,
      required: [true, 'Original text is required'],
    },
    translatedText: {
      type: String,
      required: [true, 'Translated text is required'],
    },
    domain: {
      type: String,
      default: 'General',
    },
    sourceLanguage: {
      type: String,
      default: 'English',
    },
    targetLanguage: {
      type: String,
      default: 'Vietnamese',
    },
    isCached: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

translationSchema.index({ userId: 1, originalText: 1 });

const TranslationModel = mongoose.model('Translation', translationSchema);
module.exports = getModel('Translation', TranslationModel);

