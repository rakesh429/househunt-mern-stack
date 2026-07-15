const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If email config is default mock, log to console
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === 'mock_user'
  ) {
    console.log('--- SIMULATED EMAIL SENT ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message}`);
    console.log('----------------------------');
    return true;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.EMAIL_FROM || 'noreply@househunt.com'}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    // Return true to avoid blocking application flow in dev setups
    return false;
  }
};

module.exports = sendEmail;
