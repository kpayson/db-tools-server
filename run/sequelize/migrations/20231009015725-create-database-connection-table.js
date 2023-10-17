'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DatabaseConnection', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },
      name: {
        type: DataType.STRING,
        allowNull: false,
      },
      dialect: {
        type: DataType.STRING,
        allowNull: false,
      },
      host:{
        type: DataType.STRING,
        allowNull: false,
      },  
      port: {
        type: DataType.INTEGER,
        allowNull: false,
      },  
      database: {
        type: DataType.STRING,
        allowNull: false,
      },
      username: {
        type: DataType.STRING,
        allowNull: false,
      },
      password: {
        type: DataType.STRING,
        allowNull: false,
      },
      authServer: {
        type: DataType.STRING,
        allowNull: false,
      },

    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('DatabaseConnection');
  }
};

