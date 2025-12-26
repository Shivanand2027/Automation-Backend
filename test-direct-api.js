const https = require('https');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

function testDirectAPI() {
  console.log('\n🔧 Direct API Test (bypass SDK)');
  console.log('='.repeat(60));
  
  const data = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Say hello'
      }]
    }]
  });
  
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = https.request(options, (res) => {
    let body = '';
    
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}`);
    
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse Body:');
      try {
        const json = JSON.parse(body);
        console.log(JSON.stringify(json, null, 2));
        
        if (json.candidates && json.candidates[0]) {
          console.log('\n✅ SUCCESS! API is working!');
          console.log('Response:', json.candidates[0].content.parts[0].text);
        }
      } catch (e) {
        console.log(body);
      }
      console.log('='.repeat(60));
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });
  
  req.write(data);
  req.end();
}

testDirectAPI();
