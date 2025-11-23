import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { GEMINI_API_KEY } from '../config/gemini.config';

let genAI = null;

// Initialize Gemini AI
const initializeGemini = () => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      console.warn('[GEMINI SERVICE] API key not configured. Please set your API key in src/config/gemini.config.js');
      return null;
    }
    
    if (!genAI) {
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      console.log('[GEMINI SERVICE] Gemini AI initialized successfully');
    }
    return genAI;
  } catch (error) {
    console.error('[GEMINI SERVICE ERROR] Failed to initialize Gemini AI:', error.message);
    return null;
  }
};

// List available models from the API
const listAvailableModels = async () => {
  try {
    console.log('[GEMINI SERVICE] Fetching available models...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.data && response.data.models) {
      const models = response.data.models
        .filter(model => 
          model.supportedGenerationMethods && 
          model.supportedGenerationMethods.includes('generateContent')
        )
        .map(model => model.name.replace('models/', ''));
      
      console.log('[GEMINI SERVICE] Available models:', models);
      return models;
    }
    
    return [];
  } catch (error) {
    console.error('[GEMINI SERVICE] Failed to list models:', error.response?.data || error.message);
    return [];
  }
};

// Get sports context for better responses
const getSportsContext = () => {
  return `You are a helpful sports assistant for a football (soccer) app called SoccerX. 
You help users with:
- Football match information and schedules
- Player statistics and information
- Team details and standings
- League information
- General football questions

Keep responses concise, friendly, and informative. If you don't know specific current data, 
suggest the user check the app's match listings or player database.`;
};

// Try using REST API directly (more reliable)
const tryRestAPI = async (modelName, prompt, apiVersion = 'v1beta') => {
  try {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const text = response.data.candidates[0].content.parts[0].text;
      return { success: true, text, modelName };
    }
    
    return { success: false, error: 'No response data' };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    const errorStatus = error.response?.status;
    const errorData = error.response?.data;
    
    return { 
      success: false, 
      error: errorMsg,
      status: errorStatus,
      errorData: errorData
    };
  }
};

// Try different model names until one works (using SDK)
const tryModelSDK = async (ai, modelName, prompt) => {
  try {
    console.log(`[GEMINI SERVICE] Trying SDK with model: ${modelName}`);
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(`[GEMINI SERVICE] SDK model ${modelName} worked successfully!`);
    return { success: true, text, modelName };
  } catch (error) {
    console.log(`[GEMINI SERVICE] SDK model ${modelName} failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Chat with Gemini
export const chatWithGemini = async (message, conversationHistory = []) => {
  try {
    console.log('[GEMINI SERVICE] Starting chat request...');
    const ai = initializeGemini();
    
    if (!ai) {
      return {
        success: false,
        error: 'Gemini AI not initialized. Please check your API key configuration.',
      };
    }

    // Use a limited set of models to avoid too many API calls
    const modelNames = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemma-3-1b-it',
    ];

    // Add system context
    const systemContext = getSportsContext();
    
    // Build the prompt with context
    const prompt = `${systemContext}\n\nUser: ${message}\nAssistant:`;

    // Try REST API with limited models
    let apiKeyInvalid = false;
    let quotaExceeded = false;
    
    for (const modelName of modelNames) {
      const result = await tryRestAPI(modelName, prompt, 'v1beta');
      
      if (result.success) {
        return {
          success: true,
          message: result.text,
        };
      }
      
      // Check for API key issues (403 - leaked/invalid key)
      if (result.status === 403) {
        apiKeyInvalid = true;
        const errorMsg = result.error || 'API key is invalid or has been leaked';
        if (errorMsg.toLowerCase().includes('leaked')) {
          throw new Error('Your Gemini API key has been reported as leaked. Please generate a new API key at https://makersuite.google.com/app/apikey and update it in src/config/gemini.config.js');
        } else {
          throw new Error('Your Gemini API key is invalid. Please check your API key in src/config/gemini.config.js');
        }
      }
      
      // Check for quota issues (429)
      if (result.status === 429) {
        quotaExceeded = true;
        continue;
      }
    }
    
    // If we got here and quota was exceeded, throw quota error
    if (quotaExceeded) {
      throw new Error('Gemini API quota exceeded. Please wait a few minutes and try again, or check your quota at https://ai.dev/usage');
    }
    
    // If all models failed for other reasons
    throw new Error('Unable to connect to Gemini AI. Please check your API key and internet connection.');
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to get response from Gemini AI',
    };
  }
};

// Quick question (single request, no history)
export const askQuestion = async (question) => {
  return await chatWithGemini(question);
};

// Check if Gemini is configured
export const isGeminiConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY';
};

