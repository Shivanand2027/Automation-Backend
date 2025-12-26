const { GoogleGenAI } = require('@google/genai');

const API_KEY = 'AIzaSyAgjJ9S_XWIUWY0z0VbH3CphCbeBzIlsOg';

async function testNewAPI() {
  console.log('🧪 Testing new Google AI Studio key with new API...\n');
  
  try {
    const ai = new GoogleGenAI({
      apiKey: API_KEY
    });
    
    console.log('📡 Sending test request with gemini-2.5-flash...');
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "Hello, AI Automation!" in one sentence.'
    });
    const text = result.text;
    
    console.log('\n✅ SUCCESS! API key is working!');
    console.log('📝 Response:', text);
    console.log('\n🎉 You can now restart the backend and automation will work!');
    console.log('\n💡 Run: cd backend && npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('404')) {
      console.log('\n⚠️  Still getting 404 - the key may need a few minutes to activate');
      console.log('Or try these troubleshooting steps:');
      console.log('1. Verify the API key is from https://aistudio.google.com/app/apikey');
      console.log('2. Wait 3-5 minutes for key activation');
      console.log('3. Check if you can access Google AI Studio');
    }
  }
}

testNewAPI();
