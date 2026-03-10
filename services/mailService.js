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
  return transporter.sendMail({
    from: `"KottawaHatta Team" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Happy Birthday ${user.name}! 🎉`,
    html: `<h1>Happy Birthday, ${user.name}! 🎂</h1>`,
  });
};

const sendBirthdayReminder = async (recipient, birthdayPerson) => {
  return transporter.sendMail({
    from: `"KottawaHatta Notifications" <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    subject: `Reminder: Today is ${birthdayPerson.name}'s Birthday!`,
    html: `<p>Today is ${birthdayPerson.name}'s birthday!</p>`,
  });
};

module.exports = { sendBirthdayWish, sendBirthdayReminder };