const nodemailer = require("nodemailer");

// Primary transporter (port 587)
const createPrimaryTransporter = () => {
  return nodemailer.createTransport({
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
  });
};

// Fallback transporter (port 465 - SSL)
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

let primaryTransporter = createPrimaryTransporter();
let fallbackTransporter = createFallbackTransporter();
let useFallback = false;

// Simple send with basic retry
const sendWithRetry = async (transporter, mailOptions, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      console.log(`⏳ Retry ${i + 1}/${retries}: ${error.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw lastError;
};

const sendBirthdayWish = async (user) => {
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

  try {
    // Try primary first
    await sendWithRetry(primaryTransporter, mailOptions);
    console.log(`✅ Birthday wish sent to ${user.email}`);
    useFallback = false; // Reset for next time
  } catch (error) {
    // If primary fails, try fallback
    if (!useFallback) {
      console.log('🔄 Trying fallback SMTP (port 465)...');
      useFallback = true;
      try {
        await sendWithRetry(fallbackTransporter, mailOptions);
        console.log(`✅ Birthday wish sent via fallback to ${user.email}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ Fallback also failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    console.error(`❌ Failed to send birthday wish to ${user.email}:`, error.message);
    throw error;
  }
};

const sendBirthdayReminder = async (recipient, birthdayPerson) => {
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

  const transporter = useFallback ? fallbackTransporter : primaryTransporter;
  
  try {
    await sendWithRetry(transporter, mailOptions);
    console.log(`✅ Birthday reminder sent to ${recipient.email}`);
  } catch (error) {
    // Try fallback if primary failed
    if (!useFallback) {
      useFallback = true;
      try {
        await sendWithRetry(fallbackTransporter, mailOptions);
        console.log(`✅ Reminder sent via fallback to ${recipient.email}`);
        return;
      } catch (fallbackError) {
        console.error(`❌ Fallback also failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    console.error(`❌ Failed to send reminder to ${recipient.email}:`, error.message);
    throw error;
  }
};

module.exports = { sendBirthdayWish, sendBirthdayReminder };
