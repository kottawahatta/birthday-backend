const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false 
  }
});

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

  return transporter.sendMail(mailOptions);
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

  return transporter.sendMail(mailOptions);
};

module.exports = { sendBirthdayWish, sendBirthdayReminder };