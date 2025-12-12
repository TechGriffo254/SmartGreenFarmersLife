const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIConversation = require('../models/AIConversation');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error('⚠️  GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async chat(userId, message, language = 'en', context = {}) {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build context-aware prompt
      const systemPrompt = language === 'sw' 
        ? this.getSwahiliSystemPrompt(context)
        : this.getEnglishSystemPrompt(context);

      const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        language
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  getEnglishSystemPrompt(context) {
    const { temperature, humidity, soilMoisture } = context;
    
    return `You are an expert agricultural AI assistant helping farmers manage their smart greenhouse.
    
Current Greenhouse Conditions:
${temperature ? `- Temperature: ${temperature}°C` : ''}
${humidity ? `- Humidity: ${humidity}%` : ''}
${soilMoisture ? `- Soil Moisture: ${soilMoisture}%` : ''}

Your role:
- Provide practical farming advice
- Recommend crops suitable for current conditions
- Suggest pest and disease management strategies
- Advise on irrigation and fertilization
- Explain weather impacts on crops
- Keep responses concise and actionable (2-3 paragraphs max)
- Use simple language suitable for farmers

Guidelines:
- Always consider the current greenhouse sensor data in your advice
- Prioritize organic and sustainable farming practices
- Warn about critical conditions (extreme temps, low moisture, etc.)
- Provide specific numbers and measurements when relevant`;
  }

  getSwahiliSystemPrompt(context) {
    const { temperature, humidity, soilMoisture } = context;
    
    return `Wewe ni msaidizi mahiri wa kilimo unayesaidia wakulima kusimamia greenhouse zao za kisasa.
    
Hali ya Greenhouse ya Sasa:
${temperature ? `- Joto: ${temperature}°C` : ''}
${humidity ? `- Unyevu: ${humidity}%` : ''}
${soilMoisture ? `- Unyevu wa Udongo: ${soilMoisture}%` : ''}

Jukumu lako:
- Toa ushauri wa vitendo kuhusu kilimo
- Pendekeza mazao yanayofaa kwa hali ya sasa
- Pendekeza mikakati ya kudhibiti wadudu na magonjwa
- Shauri kuhusu umwagiliaji na mbolea
- Elezea athari za hali ya hewa kwa mazao
- Weka majibu machache na ya vitendo (aya 2-3 tu)
- Tumia lugha rahisi inayofaa kwa wakulima

Miongozo:
- Kila wakati zingatia data ya vihisi vya greenhouse katika ushauri wako
- Kipaumbele mbinu za kilimo asili na endelevu
- Onya kuhusu hali hatari (joto kali, unyevu mdogo, n.k.)
- Toa nambari na vipimo mahususi vinapohitajika`;
  }

  async generatePestRecommendation(pestInfo, language = 'en') {
    if (!this.genAI) {
      throw new Error('Gemini API is not configured');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = language === 'sw'
        ? `Mdudu/Ugonjwa uliogunduliwa: ${pestInfo.label}
           Kiwango cha Uhakika: ${(pestInfo.confidence * 100).toFixed(1)}%
           
           Tafadhali toa:
           1. Maelezo mafupi ya mdudu/ugonjwa huu
           2. Hatari inayoweza kutokea kwa mazao
           3. Mbinu 3-4 za kudhibiti kwa njia asili (hakuna kemikali kali)
           4. Mbinu za kuzuia inayopaswa kufuata
           
           Jibu kwa Kiswahili, kwa ufupi (aya 2-3).`
        : `Pest/Disease detected: ${pestInfo.label}
           Confidence Level: ${(pestInfo.confidence * 100).toFixed(1)}%
           
           Please provide:
           1. Brief description of this pest/disease
           2. Potential damage to crops
           3. 3-4 organic control methods (no harsh chemicals)
           4. Prevention strategies to follow
           
           Keep response concise (2-3 paragraphs).`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Pest Recommendation Error:', error);
      throw error;
    }
  }

  async saveConversation(userId, sessionId, userMessage, assistantResponse, language, context) {
    try {
      let conversation = await AIConversation.findOne({ userId, sessionId });

      if (!conversation) {
        conversation = new AIConversation({
          userId,
          sessionId,
          messages: [],
          greenhouseContext: context
        });
      }

      conversation.messages.push(
        { role: 'user', content: userMessage, language },
        { role: 'assistant', content: assistantResponse, language }
      );

      conversation.updatedAt = new Date();
      await conversation.save();

      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
