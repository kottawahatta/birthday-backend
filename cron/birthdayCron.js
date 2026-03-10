const cron = require('node-cron');
const User = require('../models/User');
const { sendBirthdayWish, sendBirthdayReminder } = require('../services/mailService');

cron.schedule('15 20 * * *', async () => {
  console.log('🎂 Cron Job Running at 08:15 PM...');
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const searchDate = `${month}-${day}`; 

    const allUsers = await User.findAll();
    const birthdayPeople = allUsers.filter(user => 
      user.birthday && String(user.birthday).includes(searchDate)
    );

    if (birthdayPeople.length > 0) {
      for (const bPerson of birthdayPeople) {
        console.log(`📧 Sending emails for: ${bPerson.name}`);
        await sendBirthdayWish(bPerson);
        
        const others = allUsers.filter(u => u.id !== bPerson.id);
        for (const member of others) {
          await sendBirthdayReminder(member, bPerson);
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