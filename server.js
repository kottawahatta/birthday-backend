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

    const birthdayPeople = await User.findAll({
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM birthday')),
            today.getMonth() + 1
          ),
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal('DAY FROM birthday')),
            today.getDate()
          )
        ]
      }
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