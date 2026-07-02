const { GoogleGenerativeAI } = require('@google/generative-ai');

const buildSystemPrompt = (text, glossaryItems, domain, sourceLanguage = 'English', targetLanguage = 'Vietnamese') => {
  let glossaryRules = '';

  if (glossaryItems && glossaryItems.length > 0) {
    glossaryRules = glossaryItems
      .map((item) => `- "${item.sourceTerm}" MUST be translated as "${item.targetTerm}"`)
      .join('\n');
  } else {
    glossaryRules = '(No custom glossary terms defined for this domain)';
  }

  return `You are a highly skilled professional translator. 
Task: Translate the exact text provided from ${sourceLanguage} to ${targetLanguage}.
Domain context: ${domain}.
Rule 1: ONLY output the final translated text.
Rule 2: DO NOT include any conversational filler, markdown formatting, quotes, or explanations.
Rule 3: Keep the exact same tone and formatting as the original text.
Rule 4: Verify if the input text is written in the selected source language (${sourceLanguage}). If the text is clearly written in a different language (e.g. French input but English is selected), you must ONLY output the exact error message: "Lỗi: Ngôn ngữ đầu vào không khớp với ngôn ngữ nguồn đã chọn (${sourceLanguage})." without any other explanation, quotes or formatting. If the input text is very short (1-2 words), proper nouns, names, or ambiguous, treat it as correct and proceed with the translation normally.
Specific terms/glossary to respect:
${glossaryRules}`;
};

const translateText = async (text, glossaryItems = [], domain = 'General', sourceLanguage = 'English', targetLanguage = 'Vietnamese') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const systemPrompt = buildSystemPrompt(text, glossaryItems, domain, sourceLanguage, targetLanguage);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt
  });

  const result = await model.generateContent(`Text to translate: "${text}"`);
  const response = await result.response;
  let translatedText = response.text().trim();

  if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
    translatedText = translatedText.slice(1, -1);
  }

  return { translatedText };
};

const validateGlossaryTerm = async (sourceTerm, targetTerm, sourceLanguage, targetLanguage) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `You are a professional linguistic validation tool.
Task: Validate if:
- "${sourceTerm}" is a valid word, term, phrase, abbreviation, or proper noun in the source language "${sourceLanguage}".
- "${targetTerm}" is a valid word, term, phrase, abbreviation, or proper noun in the target language "${targetLanguage}".

Rules:
1. If both are correct, respond with ONLY: "VALID"
2. If "${sourceTerm}" is NOT valid in ${sourceLanguage}, respond with ONLY: "INVALID_SOURCE: <brief explanation in Vietnamese of why '${sourceTerm}' is not in ${sourceLanguage}>"
3. If "${targetTerm}" is NOT valid in ${targetLanguage}, respond with ONLY: "INVALID_TARGET: <brief explanation in Vietnamese of why '${targetTerm}' is not in ${targetLanguage}>"
4. Do not include quotes, markdown formatting, or any extra text. Be brief. Output only the status string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.warn('AI validation failed, using offline fallback check:', error.message);
    
    
    const checkLanguageOffline = (term, language) => {
      const t = term.trim();
      if (!t) return false;

      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(t);
      const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(t);
      
      
      
      const hasVietnameseAccents = /[ăâđêôơưàảãạằắẳẵặầấẩẫậèẻẽẹềếểễệìỉĩịòỏõọồốổỗộờớởỡợùủũụừứửữựỳỷỹỵ]/i.test(t);
      
      
      const hasFrenchAccents = /[çœæëïüÿîûâêôôéèù]/i.test(t);
      const hasSpanishAccents = /[ñáéíóúü¿¡]/i.test(t);

      switch (language) {
        case 'Japanese':
          return hasJapanese;
        case 'Korean':
          return hasKorean;
        case 'Vietnamese':
          if (hasJapanese || hasKorean) return false;
          return true; 
        case 'English':
          if (hasJapanese || hasKorean || hasVietnameseAccents || hasFrenchAccents || hasSpanishAccents) return false;
          return true;
        case 'French':
          if (hasJapanese || hasKorean || hasVietnameseAccents || hasSpanishAccents) return false;
          return true;
        case 'Spanish':
          if (hasJapanese || hasKorean || hasVietnameseAccents || hasFrenchAccents) return false;
          return true;
        default:
          return true;
      }
    };

    const isSourceOk = checkLanguageOffline(sourceTerm, sourceLanguage);
    if (!isSourceOk) {
      return `INVALID_SOURCE: Từ '${sourceTerm}' không hợp lệ hoặc không phải là tiếng ${sourceLanguage}.`;
    }

    const isTargetOk = checkLanguageOffline(targetTerm, targetLanguage);
    if (!isTargetOk) {
      return `INVALID_TARGET: Từ '${targetTerm}' không hợp lệ hoặc không phải là tiếng ${targetLanguage}.`;
    }

    return 'VALID';
  }
};

module.exports = {
  buildSystemPrompt,
  translateText,
  validateGlossaryTerm,
};
