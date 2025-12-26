const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyAgjJ9S_XWIUWY0z0VbH3CphCbeBzIlsOg';

async function testNewKey() {
  console.log('🧪 Testing new Google AI Studio key...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('📡 Sending test request...');
    const result = await model.generateContent('Say "Hello, AI Automation!" in one sentence.');
    const response = result.response;
    const text = response.text();
    
    console.log('\n✅ SUCCESS! API key is working!');
    console.log('📝 Response:', text);
    console.log('\n🎉 You can now restart the backend and automation will work!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('404')) {
      console.log('\n⚠️  Still getting 404 - the key may need a few minutes to activate');
    }
  }
}

testNewKey();
