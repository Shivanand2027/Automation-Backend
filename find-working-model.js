const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

async function testModels() {
  console.log('Testing Different Model Names');
  console.log('='.repeat(60));
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Try models without version prefix
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🔍 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say "Hello" in one word');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS! Model "${modelName}" works!`);
      console.log(`   Response: ${text}`);
      console.log('\n' + '='.repeat(60));
      console.log(`🎉 USE THIS MODEL: "${modelName}"`);
      console.log('='.repeat(60));
      return modelName; // Return the working model
      
    } catch (error) {
      const errorMsg = error.message.substring(0, 80);
      console.log(`❌ Failed: ${errorMsg}...`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  None of the standard models worked.');
  console.log('Your API key might need additional setup.');
  console.log('='.repeat(60));
}

testModels();
