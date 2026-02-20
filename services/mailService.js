const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Wish to the Birthday Boy/Girl
const sendBirthdayWish = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff4757, #ff6b81); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0;">Happy Birthday, ${user.name}! 🎂</h1>
      </div>
      <div style="padding: 30px; line-height: 1.6; color: #333;">
        <p>Hi ${user.name},</p>
        <p>Wishing you a day filled with happiness and a year filled with joy. Happy Birthday from all of us!</p>
        <p>Stay amazing!</p>
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0; font-weight: bold; color: #ff4757;">KottawaHatta Team</p>
        </div>
      </div>
    </div>`;

  return transporter.sendMail({
    from: `"KottawaHatta Team" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Happy Birthday ${user.name}! 🎉`,
    html,
  });
};

// Send Reminder to the rest of the friends
const sendBirthdayReminder = async (recipient, birthdayPerson) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h3 style="color: #2f3542;">🎂 Birthday Reminder</h3>
      <p>Hi ${recipient.name},</p>
      <p>Today is <b>${birthdayPerson.name}'s</b> birthday!</p>
      <p>Don't forget to reach out and send your best wishes.</p>
      <p>Best regards,<br>KottawaHatta Bot</p>
    </div>`;

  return transporter.sendMail({
    from: `"KottawaHatta Notifications" <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    subject: `Reminder: Today is ${birthdayPerson.name}'s Birthday!`,
    html,
  });
};

module.exports = { sendBirthdayWish, sendBirthdayReminder };