require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const { Op } = require('sequelize');
const { sendBirthdayWish, sendBirthdayReminder } = require('./services/mailService');

// Load Cron job
require('./cron/birthdayCron');

const app = express();
app.use(express.json());

// Database Connection
connectDB();

// Email Status Tracking
let emailStatus = {
  lastAttempt: null,
  lastError: null,
  lastSuccess: null,
  isConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
};

app.get('/', (req, res) => res.send('KottawaHatta Birthday System is Running 🎉'));

// 📊 Status Endpoint for Railway
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Colombo',
    emailService: {
      configured: emailStatus.isConfigured,
      lastAttempt: emailStatus.lastAttempt,
      lastError: emailStatus.lastError,
      lastSuccess: emailStatus.lastSuccess
    },
    cronSchedule: '16:15 (Sri Lanka Time) daily'
  });
});

// 🛠 Manual Email Test
app.get('/test-email', async (req, res) => {
  console.log("--- 🔍 Manual Test Started ---");
  emailStatus.lastAttempt = new Date().toISOString();
  
  if (!emailStatus.isConfigured) {
    const error = 'Email not configured. Set EMAIL_USER and EMAIL_PASS environment variables.';
    emailStatus.lastError = error;
    return res.status(500).json({ error });
  }
  
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const birthdayPeople = await User.findAll({
      where: { birthday: { [Op.iLike]: `%-${month}-${day}` } }
    });

    console.log("Users found:", birthdayPeople.length);

    if (birthdayPeople.length === 0) {
      return res.send(`No birthdays found in database for today.`);
    }

    const allUsers = await User.findAll();

    for (const bPerson of birthdayPeople) {
      // Send Birthday Wish to the person
      await sendBirthdayWish(bPerson);
      console.log(`✅ Wish mail sent to: ${bPerson.email}`);

      // Send Reminder Emails to all other users
      const others = allUsers.filter(u => u.id !== bPerson.id);
      for (const member of others) {
        await sendBirthdayReminder(member, bPerson);
        console.log(`🔔 Reminder sent to: ${member.email}`);
      }
    }

    res.send("✅ Test Emails Sent Successfully! Please check the inbox.");
    emailStatus.lastSuccess = new Date().toISOString();
    emailStatus.lastError = null;
  } catch (error) {
    console.error("❌ Error:", error);
    emailStatus.lastError = error.message;
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Test Link: http://localhost:5000/test-email`);
  console.log(`📊 Status: http://localhost:5000/status`);
});