const https = require('https');

const API_KEY = 'AIzaSyCEF_LjWGfvXHxI5TsHNGPa9ilDO9ASr8g';

// Test all API versions
const versions = ['v1', 'v1alpha', 'v1beta', 'v1beta1', 'v1beta2', 'v1beta3'];

// Test multiple model names
const modelNames = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-2.0-flash-exp'
];

async function testModel(version, modelName) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{ text: "Say 'Hello'" }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/${version}/models/${modelName}:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          version,
          model: modelName,
          status: res.statusCode,
          success: res.statusCode === 200,
          response: body.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        version,
        model: modelName,
        status: 'ERROR',
        success: false,
        response: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        version,
        model: modelName,
        status: 'TIMEOUT',
        success: false,
        response: 'Request timed out'
      });
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing all API versions and models...\n');
  console.log('='.repeat(80));
  
  const results = [];
  let successCount = 0;
  
  for (const version of versions) {
    console.log(`\n📋 Testing API Version: ${version}`);
    console.log('-'.repeat(80));
    
    for (const model of modelNames) {
      const result = await testModel(version, model);
      results.push(result);
      
      const statusIcon = result.success ? '✅' : '❌';
      console.log(`${statusIcon} ${model.padEnd(30)} | Status: ${result.status}`);
      
      if (result.success) {
        successCount++;
        console.log(`   Response preview: ${result.response.substring(0, 100)}...`);
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${results.length - successCount}`);
  
  if (successCount > 0) {
    console.log('\n✅ WORKING COMBINATIONS:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   ${r.version}/${r.model}`);
    });
  } else {
    console.log('\n❌ NO WORKING COMBINATIONS FOUND');
    console.log('\n💡 Common reasons:');
    console.log('   1. Billing not enabled in Google Cloud Console');
    console.log('   2. API key needs more time to activate (wait 5-10 more minutes)');
    console.log('   3. Wrong project or API key type');
    console.log('   4. Generative Language API not properly enabled');
  }
}

runTests().catch(console.error);
