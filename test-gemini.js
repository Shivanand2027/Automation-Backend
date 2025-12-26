const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

async function testGeminiAPI() {
  console.log('Testing Gemini API with new key...\n');
  console.log('='.repeat(60));
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  // Try different model names
  const modelsToTry = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  let successCount = 0;
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🔍 Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say "Hello" in one word');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS! Model "${modelName}" works!`);
      console.log(`   Response: ${text}`);
      console.log(`   Status: This model is available and working!`);
      successCount++;
      
      if (successCount === 1) {
        console.log('\n' + '='.repeat(60));
        console.log('✨ RECOMMENDED MODEL FOR YOUR PROJECT:');
        console.log(`   Use: "${modelName}"`);
        console.log('='.repeat(60));
      }
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message.substring(0, 100)}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (successCount > 0) {
    console.log(`\n🎉 SUCCESS! ${successCount} model(s) are working with your API key!`);
    console.log('Your automation platform is ready to use.');
  } else {
    console.log('\n⚠️  No models are working. Please check your API key.');
    console.log('Visit: https://aistudio.google.com/app/apikey');
  }
  console.log('='.repeat(60) + '\n');
}

testGeminiAPI().catch(console.error);
