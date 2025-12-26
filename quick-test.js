const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

async function quickTest() {
  console.log('\n🚀 Quick Gemini API Test');
  console.log('='.repeat(60));
  console.log(`Testing at: ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(60));
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  
  try {
    console.log('\nTesting model: gemini-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('What is 2+2? Answer in one number only.');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! API is working!');
    console.log('Response:', text);
    console.log('\n🎉 Your automation platform is ready to use!');
    console.log('Run: npm run dev');
    console.log('Then visit: http://localhost:3000');
    console.log('='.repeat(60));
    
  } catch (error) {
    if (error.message.includes('404')) {
      console.log('\n⏳ API key was just created...');
      console.log('Wait 2-3 more minutes for it to activate.');
      console.log('Then run this test again: node quick-test.js');
    } else if (error.message.includes('403')) {
      console.log('\n⚠️  Permission denied. Check billing settings.');
      console.log('Visit: https://console.cloud.google.com/billing');
    } else {
      console.log('\n❌ Error:', error.message.substring(0, 150));
    }
    console.log('='.repeat(60));
  }
}

quickTest();
