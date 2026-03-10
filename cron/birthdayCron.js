const cron = require('node-cron');
const User = require('../models/User');
const { sendBirthdayWish, sendBirthdayReminder } = require('../services/mailService');

cron.schedule('0 1 * * *', async () => {
  console.log('🎂 Cron Job Running at 01:00 AM...');
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const searchDate = `${month}-${day}`; 

    const allUsers = await User.findAll();
    const birthdayPeople = allUsers.filter(user => {
      if (!user.birthday) return false;
      const bday = new Date(user.birthday);
      return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
    });

    if (birthdayPeople.length > 0) {
      for (const bPerson of birthdayPeople) {
        console.log(`📧 Sending emails for: ${bPerson.name}`);
        try {
          await sendBirthdayWish(bPerson);
          
          const others = allUsers.filter(u => u.id !== bPerson.id);
          for (const member of others) {
            await sendBirthdayReminder(member, bPerson);
          }
        } catch (error) {
          console.error(`❌ Error sending emails for ${bPerson.name}:`, error.message);
        }
      }
    } else {
      console.log('😴 No birthdays found today.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Colombo"
});