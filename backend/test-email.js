import sendEmail from './utils/sendEmail.js';

(async () => {
  try {
    await sendEmail({
      email: 'test@example.com',
      subject: 'Test Email',
      message: 'This is a test'
    });
    console.log('Success');
  } catch (err) {
    console.error('Failed:', err.message);
  }
})();
