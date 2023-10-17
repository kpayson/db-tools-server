'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CommandTemplate', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },
      name: {
        type: DataType.STRING,
        allowNull: false,
      },
      template: {
        type: DataType.STRING(4000),
        allowNull: false,
      },
      resultLocationType:{
        type: DataType.STRING,
        allowNull: false,
      },
      resultFilePath: {
        type: DataType.STRING,
        allowNull: true,
      },
      resultFileType: {
        type: DataType.STRING,
        allowNull: true,
      },
    });
  },
  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('CommandTemplate');
  }
};
