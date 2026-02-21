const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  birthday: {
    type: DataTypes.STRING, // Format: YYYY-MM-DD (e.g., 1997-09-26)
    allowNull: false
  }
}, {
  tableName: 'friends',
  timestamps: false 
});

module.exports = User;