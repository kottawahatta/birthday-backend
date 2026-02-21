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

app.get('/', (req, res) => res.send('KottawaHatta Birthday System is Running 🎉'));

// 🛠 Test Route (Manual trigger)
app.get('/test-email', async (req, res) => {
  console.log("--- 🔍 Manual Test Started ---");
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const searchDate = `-${month}-${day}`; 

    console.log("Searching for date pattern:", searchDate);

    const birthdayPeople = await User.findAll({
      where: { birthday: { [Op.iLike]: `%${searchDate}` } }
    });

    console.log("Users found:", birthdayPeople.length);

    if (birthdayPeople.length === 0) {
      return res.send(`No birthdays found in database for date pattern: ${searchDate}`);
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
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Error: " + error.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Test Link: http://localhost:5000/test-email`);
});