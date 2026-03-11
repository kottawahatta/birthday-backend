const cron = require('node-cron');
const User = require('../models/User');
const { sendBirthdayWish, sendBirthdayReminder } = require('../services/mailService');

console.log('🎂 Birthday Cron Job Loaded - Ready to run at 16:15 daily (Sri Lanka Time)');

cron.schedule('26 16 * * *', async () => { 
  console.log('===========================================');
  console.log('🎂 Cron Job Running at 16:15 (Sri Lanka Time)...');
  console.log('===========================================');
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
      console.log(`🎉 Found ${birthdayPeople.length} birthday(s) today!`);
      for (const bPerson of birthdayPeople) {
        console.log(`📧 Processing: ${bPerson.name} (${bPerson.email})`);
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
    console.error('❌ Cron Job Error:', error.message);
    console.error('Stack:', error.stack);
  }
}, {
  scheduled: true,
  timezone: "Asia/Colombo"
});