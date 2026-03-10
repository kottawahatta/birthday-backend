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
        <p style="font-size: 16px; color: #333;">Wishing you a day filled with happiness and a year filled with joy. Have a fantastic celebration!</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #777; text-align: center;">Sent with ❤️ by KottawaHatta Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Wish sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Wish Error (${user.email}):`, error.message);
    throw error;
  }
};

const sendBirthdayReminder = async (recipient, birthdayPerson) => {
  const mailOptions = {
    from: `"KottawaHatta Notifications" <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    subject: `Birthday Reminder: Today is ${birthdayPerson.name}'s Birthday! 🎈`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 15px; background-color: #f9f9f9;">
        <p style="font-size: 16px;">Hi ${recipient.name},</p>
        <p style="font-size: 16px;">Today is <b>${birthdayPerson.name}</b>'s birthday! Don't forget to send your wishes. 🎂</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder sent to ${recipient.email}`);
    return info;
  } catch (error) {
    console.error(`❌ Reminder Error (${recipient.email}):`, error.message);
  }
};

module.exports = { sendBirthdayWish, sendBirthdayReminder };