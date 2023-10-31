'use strict';

var DataType = require('sequelize/lib/data-types');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('PerfTestResult', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      connectionId: {
        type: DataType.INTEGER,
        allowNull: false,
      },
      vus:{
        type: DataType.INTEGER,
        allowNull: false,
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
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('PerfTestResult');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
