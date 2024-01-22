'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('DataReportRunResult', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },

      parametersJson: {
        type: DataType.STRING(4000),
        allowNull: true,
      },

      runByUser:{
        type: DataType.STRING,
        allowNull: true,
      },
      runDate:{
        type: DataType.DATE,
        allowNull: false,
      },
      comment:{
        type: DataType.STRING,
        allowNull: true,
      },
      htmlReport:{
        type: DataType.BLOB,
        allowNull: false
      }

    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
