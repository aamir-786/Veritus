const emailService = require('./src/services/emailService');

async function test() {
  console.log('Testing email service...');
  try {
    const result = await emailService.sendVerificationEmail({
      email: 'aamir.fss22@gmail.com',
      name: 'Test User',
      verificationToken: 'test-token-123'
    });
    console.log('Result:', result);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
