const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

async function listModels() {
  console.log('Listing Available Gemini Models');
  console.log('='.repeat(60));
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('\n✅ API Key is valid!\n');
    console.log('Available Models:');
    console.log('-'.repeat(60));
    
    for (const model of models) {
      console.log(`\n📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      if (model.supportedGenerationMethods) {
        console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Use one of these model names in your application!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n❌ Error listing models:');
    console.log('Message:', error.message);
    console.log('\nThis might mean:');
    console.log('1. The API key is invalid');
    console.log('2. The Generative Language API is not enabled');
    console.log('3. There are permission issues with the key');
    console.log('\nPlease check your Google Cloud Console.');
  }
}

listModels();
