const cron = require('node-cron');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendBirthdayWish, sendBirthdayReminder } = require('../services/mailService');

cron.schedule('30 18 * * *', async () => {
  console.log('🎂 Cron Job: Checking for birthdays...');
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const searchDate = `-${month}-${day}`;

    
    const birthdayPeople = await User.findAll({
      where: { birthday: { [Op.cast]: 'text' }, [Op.iLike]: `%${searchDate}` }
    });

    if (birthdayPeople.length > 0) {
      const allUsers = await User.findAll();
      
      for (const bPerson of birthdayPeople) {
        console.log(`🎉 Found birthday: ${bPerson.name}`);
        
        
        await sendBirthdayWish(bPerson);
        
        
        const others = allUsers.filter(u => u.id !== bPerson.id);
        for (const member of others) {
          await sendBirthdayReminder(member, bPerson);
        }
      }
      console.log('✅ Cron job: Birthday emails and reminders processed.');
    } else {
      console.log('😴 Cron job: No birthdays found today.');
    }
  } catch (error) {
    console.error('❌ Cron Job Error:', error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Colombo" 
});