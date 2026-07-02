const Translation = require('../models/Translation');
const Glossary = require('../models/Glossary');
const aiService = require('../services/aiService');

const translate = async (req, res) => {
  try {
    console.log("1. Request Received:", req.body);
    console.log("Current GEMINI_API_KEY value length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);

    const {
      text,
      domain = 'General',
      sourceLanguage = 'English',
      targetLanguage = 'Vietnamese'
    } = req.body;
    const user = req.user;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Text is required' });
    }

    const cleanText = text.replace(/\s/g, '');
    if (cleanText.length > 2000) {
      return res.status(400).json({ message: 'Nội dung dịch vượt quá giới hạn 2000 ký tự.' });
    }

    let cacheResult = null;
    if (user) {
      cacheResult = await Translation.findOne({
        userId: user.id,
        originalText: text,
        domain,
        sourceLanguage,
        targetLanguage,
      });
    }
    console.log("2. Cache Check Result:", cacheResult);

    if (cacheResult) {
      const glossaryItems = user ? await Glossary.find({ userId: user.id, domain, sourceLanguage, targetLanguage, isActive: true }) : [];
      let glossaryTermsUsed = 0;
      if (glossaryItems && glossaryItems.length > 0) {
        for (const item of glossaryItems) {
          const regex = new RegExp(`\\b${item.sourceTerm}\\b`, 'gi');
          if (regex.test(text)) {
            glossaryTermsUsed++;
          }
        }
      }

      let savedDoc = null;
      if (user) {
        savedDoc = await Translation.create({
          userId: user.id,
          originalText: text,
          translatedText: cacheResult.translatedText,
          domain,
          sourceLanguage,
          targetLanguage,
          isCached: true,
        });
      }

      return res.json({
        success: true,
        _id: savedDoc ? savedDoc._id : undefined,
        translatedText: cacheResult.translatedText,
        fromCache: true,
        glossaryTermsUsed
      });
    }

    const glossaryItems = user ? await Glossary.find({ userId: user.id, domain, sourceLanguage, targetLanguage, isActive: true }) : [];

    let glossaryTermsUsed = 0;
    if (glossaryItems && glossaryItems.length > 0) {
      for (const item of glossaryItems) {
        const regex = new RegExp(`\\b${item.sourceTerm}\\b`, 'gi');
        if (regex.test(text)) {
          glossaryTermsUsed++;
        }
      }
    }

    const { translatedText } = await aiService.translateText(
      text,
      glossaryItems,
      domain,
      sourceLanguage,
      targetLanguage
    );

    if (translatedText.startsWith('Lỗi: Ngôn ngữ đầu vào không khớp')) {
      return res.status(400).json({ message: translatedText });
    }

    let savedDoc = null;
    if (user) {
      savedDoc = await Translation.create({
        userId: user.id,
        originalText: text,
        translatedText,
        domain,
        sourceLanguage,
        targetLanguage,
        isCached: false,
      });
    }

    return res.json({
      success: true,
      _id: savedDoc ? savedDoc._id : undefined,
      translatedText,
      glossaryTermsUsed
    });
  } catch (error) {
    console.error('Translation Endpoint Failure:', error);
    let message = 'Gemini API translation failed';
    const errMsg = error.message ? error.message.toLowerCase() : '';
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('limit')) {
      message = 'Hạn ngạch (Quota) tài khoản Gemini API miễn phí của bạn đã hết hoặc bị giới hạn. Vui lòng kiểm tra lại cấu hình hoặc thử lại sau.';
    } else if (errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('high demand')) {
      message = 'Dịch vụ Gemini API hiện đang bị quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau.';
    }
    return res.status(500).json({
      message,
      error: error.message
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Translation.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTranslation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const removed = await Translation.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: 'Translation not found' });
    }
    res.json({ message: 'Translation deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { translate, getHistory, deleteTranslation };


