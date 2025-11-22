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
    console.log(`[GEMINI SERVICE] Trying REST API with model: ${modelName} (API version: ${apiVersion})`);
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log(`[GEMINI SERVICE] REST API URL: ${url.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN')}`);
    
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
      console.log(`[GEMINI SERVICE] REST API with ${modelName} worked successfully!`);
      return { success: true, text, modelName };
    }
    
    return { success: false, error: 'No response data' };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    const errorStatus = error.response?.status;
    const errorData = error.response?.data;
    
    console.error(`[GEMINI SERVICE] REST API with ${modelName} failed:`);
    console.error(`  Status: ${errorStatus}`);
    console.error(`  Message: ${errorMsg}`);
    if (errorData) {
      console.error(`  Full error data:`, JSON.stringify(errorData, null, 2));
    }
    
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

    // First, get list of available models from the API
    console.log('[GEMINI SERVICE] Fetching available models from API...');
    const availableModels = await listAvailableModels();
    
    // Use available models if we got any, otherwise fall back to known working models
    let modelNames = [];
    if (availableModels && availableModels.length > 0) {
      // Prioritize known working models first
      const priorityModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      const prioritized = [];
      const others = [];
      
      availableModels.forEach(model => {
        if (priorityModels.includes(model)) {
          prioritized.push(model);
        } else {
          others.push(model);
        }
      });
      
      // Sort priority models by priority order
      prioritized.sort((a, b) => priorityModels.indexOf(a) - priorityModels.indexOf(b));
      
      modelNames = [...prioritized, ...others];
      console.log(`[GEMINI SERVICE] Found ${availableModels.length} available models, prioritized list:`, modelNames);
    } else {
      // Fallback to known working model names
      modelNames = [
        'gemini-2.5-flash',   // Known to work
        'gemini-2.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro',
      ];
      console.log('[GEMINI SERVICE] Could not fetch model list, using fallback names');
    }

    // Add system context
    const systemContext = getSportsContext();
    
    // Build the prompt with context
    const prompt = `${systemContext}\n\nUser: ${message}\nAssistant:`;

    console.log('[GEMINI SERVICE] Sending request to Gemini...');
    
    // Try REST API first (more reliable)
    // Try v1beta first, then v1 if that fails
    console.log('[GEMINI SERVICE] Trying REST API first...');
    const errors = [];
    
    const apiVersions = ['v1beta', 'v1'];
    
    for (const apiVersion of apiVersions) {
      console.log(`[GEMINI SERVICE] Trying API version: ${apiVersion}`);
      for (const modelName of modelNames) {
        const result = await tryRestAPI(modelName, prompt, apiVersion);
        if (result.success) {
          console.log(`[GEMINI SERVICE] REST API (${apiVersion}) response received successfully with model: ${modelName}`);
          return {
            success: true,
            message: result.text,
          };
        } else {
          const errorInfo = `${apiVersion}/${modelName}: ${result.error} (Status: ${result.status})`;
          errors.push(errorInfo);
          
          // Don't log quota/rate limit errors as errors if we can still proceed
          const isQuotaError = result.status === 429 || 
            (result.errorData?.error?.code === 429) ||
            (result.error && result.error.toLowerCase().includes('quota'));
          
          if (isQuotaError) {
            console.log(`[GEMINI SERVICE] ${errorInfo} (Rate limit - will retry with next model)`);
          } else {
            console.log(`[GEMINI SERVICE] ${errorInfo}`);
            // Only log error details for non-quota errors
            if (result.errorData?.error?.details && !isQuotaError) {
              console.error(`[GEMINI SERVICE] Error details:`, result.errorData.error.details);
            }
          }
        }
      }
    }
    
    console.error('[GEMINI SERVICE] All REST API attempts failed. Summary of errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    
    // If REST API failed, try SDK
    console.log('[GEMINI SERVICE] REST API failed, trying SDK...');
    for (const modelName of modelNames) {
      const result = await tryModelSDK(ai, modelName, prompt);
      if (result.success) {
        console.log('[GEMINI SERVICE] SDK response received successfully');
        return {
          success: true,
          message: result.text,
        };
      }
    }
    
    // If all models failed
    throw new Error('All model names and methods failed. Please verify your API key is valid and has access to Gemini models. Check: https://makersuite.google.com/app/apikey');
  } catch (error) {
    console.error('===========================================');
    console.error('[GEMINI SERVICE ERROR] Error in chat request:');
    console.error('[GEMINI SERVICE ERROR] Error type:', error.constructor.name);
    console.error('[GEMINI SERVICE ERROR] Error message:', error.message);
    console.error('[GEMINI SERVICE ERROR] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('===========================================');
    
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

