const cron = require('node-cron');
const User = require('../models/User');
const { Op } = require('sequelize');
const { sendBirthdayWish, sendBirthdayReminder } = require('../services/mailService');

// Schedule to run every day at 03:00 AM
cron.schedule('45 17 * * *', async () => {
  console.log('🎂 Cron Job: Checking for birthdays...');
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const searchDate = `-${month}-${day}`;

    const birthdayPeople = await User.findAll({
      where: { birthday: { [Op.iLike]: `%${searchDate}` } }
    });

    if (birthdayPeople.length > 0) {
      const allUsers = await User.findAll();
      
      for (const bPerson of birthdayPeople) {
        // Send wish to the birthday person
        await sendBirthdayWish(bPerson);
        
        // Notify everyone else
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
});