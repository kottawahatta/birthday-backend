const nodemailer = require("nodemailer");

// Try multiple SMTP configurations
const createTransporter = () => {
  // Option 1: Port 587 (STARTTLS)
  const config1 = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      rejectUnauthorized: false,
    }
  };

  // Option 2: Port 465 (SSL)
  const config2 = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 30000,
    socketTimeout: 30000
  };

  return nodemailer.createTransport(config1);
};

const transporter = createTransporter();

// Fallback transporter with different port
const createFallbackTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 30000,
    socketTimeout: 30000
  });
};

let currentTransporter = transporter;
let useFallback = false;

// Retry helper with exponential backoff and fallback
const sendWithRetry = async (sendFn, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await sendFn();
    } catch (error) {
      lastError = error;
      console.log(`⏳ Retry ${i + 1}/${retries}: ${error.message}`);
      
      // If timeout, try fallback transporter
      if ((error.message.includes('timeout') || error.code === 'ECONNREFUSED') && !useFallback) {
        console.log('🔄 Trying fallback SMTP configuration (port 465)...');
        currentTransporter = createFallbackTransporter();
        useFallback = true;
        sendFn = () => sendFn(); // Recreate the send function with new transporter
      }
      
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000 * (i + 1)));
    }
  }
  throw lastError;
};

const sendBirthdayWish = async (user) => {
  try {
    const mailOptions = {
      from: `"KottawaHatta Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Happy Birthday ${user.name}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h1 style="color: #e67e22; text-align: center;">Happy Birthday, ${user.name}! 🎂</h1>
          <p style="font-size: 16px; color: #333;">Wishing you a fantastic day ahead!</p>
        </div>`
    };

    await sendWithRetry(() => currentTransporter.sendMail(mailOptions));
    console.log(`✅ Birthday wish sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send birthday wish to ${user.email}:`, error.message);
    throw error;
  }
};

const sendBirthdayReminder = async (recipient, birthdayPerson) => {
  try {
    const mailOptions = {
      from: `"KottawaHatta Notifications" <${process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject: `Birthday Reminder: Today is ${birthdayPerson.name}'s Birthday!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 15px; background-color: #f9f9f9;">
          <p>Hi ${recipient.name},</p>
          <p>Today is <b>${birthdayPerson.name}</b>'s birthday! Please send your wishes.</p>
        </div>`
    };

    await sendWithRetry(() => currentTransporter.sendMail(mailOptions));
    console.log(`✅ Birthday reminder sent to ${recipient.email}`);
  } catch (error) {
    console.error(`❌ Failed to send reminder to ${recipient.email}:`, error.message);
    throw error;
  }
};

module.exports = { sendBirthdayWish, sendBirthdayReminder };