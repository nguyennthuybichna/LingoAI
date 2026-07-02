const Glossary = require('../models/Glossary');
const aiService = require('../services/aiService');


const getGlossary = async (req, res) => {
  try {
    const glossary = await Glossary.find({ userId: req.user.id }).sort({ createdAt: -1 });


    res.json({
      count: glossary.length,
      data: glossary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const addGlossaryTerm = async (req, res) => {
  try {
    const { sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage } = req.body;


    if (!sourceTerm || !targetTerm) {
      return res.status(400).json({ message: 'sourceTerm and targetTerm are required' });
    }

    const sLang = sourceLanguage || 'English';
    const tLang = targetLanguage || 'Vietnamese';

    
    try {
      const validation = await aiService.validateGlossaryTerm(sourceTerm, targetTerm, sLang, tLang);
      const valUpper = validation.toUpperCase();
      if (!valUpper.includes('VALID') || valUpper.includes('INVALID')) {
        let msg = `Ngôn ngữ thuật ngữ không khớp: ${validation}`;
        if (validation.startsWith('INVALID_SOURCE:')) {
          msg = validation.replace('INVALID_SOURCE:', '').trim();
        } else if (validation.startsWith('INVALID_TARGET:')) {
          msg = validation.replace('INVALID_TARGET:', '').trim();
        }
        return res.status(400).json({ message: msg });
      }
    } catch (aiErr) {
      console.error('AI Glossary validation error:', aiErr);
      return res.status(500).json({ message: 'Lỗi xác thực ngôn ngữ thuật ngữ bằng AI: ' + aiErr.message });
    }


    const glossaryItem = await Glossary.create({
      userId: req.user.id,
      sourceTerm,
      targetTerm,
      domain: domain || 'General',
      sourceLanguage: sourceLanguage || 'English',
      targetLanguage: targetLanguage || 'Vietnamese',
    });

    res.status(201).json({
      message: 'Glossary term added successfully',
      data: glossaryItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const deleteGlossaryTerm = async (req, res) => {
  try {
    const { id } = req.params;


    const glossaryItem = await Glossary.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });


    if (!glossaryItem) {
      return res.status(404).json({ message: 'Glossary term not found' });
    }

    res.json({
      message: 'Glossary term deleted successfully',
      data: glossaryItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateGlossaryTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage, isActive } = req.body;

    if (sourceTerm && targetTerm) {
      const sLang = sourceLanguage || 'English';
      const tLang = targetLanguage || 'Vietnamese';
      try {
        const validation = await aiService.validateGlossaryTerm(sourceTerm, targetTerm, sLang, tLang);
        const valUpper = validation.toUpperCase();
        if (!valUpper.includes('VALID') || valUpper.includes('INVALID')) {
          let msg = `Ngôn ngữ thuật ngữ không khớp: ${validation}`;
          if (validation.startsWith('INVALID_SOURCE:')) {
            msg = validation.replace('INVALID_SOURCE:', '').trim();
          } else if (validation.startsWith('INVALID_TARGET:')) {
            msg = validation.replace('INVALID_TARGET:', '').trim();
          }
          return res.status(400).json({ message: msg });
        }
      } catch (aiErr) {
        console.error('AI Glossary validation error:', aiErr);
        return res.status(500).json({ message: 'Lỗi xác thực ngôn ngữ thuật ngữ bằng AI: ' + aiErr.message });
      }
    }

    const glossaryItem = await Glossary.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { sourceTerm, targetTerm, domain, sourceLanguage, targetLanguage, isActive },
      { new: true, runValidators: true }
    );

    if (!glossaryItem) {
      return res.status(404).json({ message: 'Glossary term not found' });
    }

    res.json({
      message: 'Glossary term updated successfully',
      data: glossaryItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getGlossary, addGlossaryTerm, deleteGlossaryTerm, updateGlossaryTerm };


