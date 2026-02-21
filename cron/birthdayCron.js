const cron = require('node-cron');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendBirthdayWish, sendBirthdayReminder } = require('../services/mailService');

// සෑම දිනකම රාත්‍රී 10:45 ට ක්‍රියාත්මක වේ
cron.schedule('47 22 * * *', async () => {
  console.log('🎂 Cron Job: Checking for birthdays...');
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const searchDate = `${month}-${day}`; 

    const allUsers = await User.findAll();
    
    const birthdayPeople = allUsers.filter(user => {
      if (!user.birthday) return false;
      const bDayStr = String(user.birthday); 
      return bDayStr.includes(searchDate);
    });

    if (birthdayPeople.length > 0) {
      console.log(`🎉 Found ${birthdayPeople.length} birthday(s) today.`);
      for (const bPerson of birthdayPeople) {
        console.log(`📧 Sending emails for: ${bPerson.name}`);
        await sendBirthdayWish(bPerson).catch(e => console.error(`Failed to send wish: ${e.message}`));
        
        const others = allUsers.filter(u => u.id !== bPerson.id);
        for (const member of others) {
          await sendBirthdayReminder(member, bPerson).catch(e => console.error(`Failed to send reminder: ${e.message}`));
        }
      }
      console.log('✅ Cron job execution finished.');
    } else {
      console.log('😴 Cron job: No birthdays found for today.');
    }
  } catch (error) {
    console.error('❌ Cron Job Error:', error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Colombo"
});