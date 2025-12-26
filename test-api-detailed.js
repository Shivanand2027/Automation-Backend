const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

async function testAPI() {
  console.log('Detailed API Test');
  console.log('='.repeat(60));
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  console.log('='.repeat(60));
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    console.log('\nTrying gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS!');
    console.log('Response:', text);
    console.log('\nYour API key is working correctly!');
    
  } catch (error) {
    console.log('\n❌ ERROR DETAILS:');
    console.log('Name:', error.name);
    console.log('Message:', error.message);
    console.log('\nFull Error:', error);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n⚠️  The API key is invalid or has been deleted.');
    } else if (error.message.includes('403')) {
      console.log('\n⚠️  Access forbidden. The API might not be enabled for this key.');
    } else if (error.message.includes('404')) {
      console.log('\n⚠️  Model not found. The model might not be available for your key.');
    } else {
      console.log('\n⚠️  Unknown error. Check your internet connection.');
    }
    
    console.log('\nTroubleshooting:');
    console.log('1. Go to: https://aistudio.google.com/app/apikey');
    console.log('2. Verify your API key is active');
    console.log('3. Try testing it in Google AI Studio first');
    console.log('4. Make sure you have internet access');
  }
}

testAPI();
