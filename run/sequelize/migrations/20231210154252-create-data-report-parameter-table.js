'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('DataReportParameter', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },
      dataReportId: {
        type:DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'DataReport',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: DataType.STRING,
      },
      // dataType:{
      //   type: DataType.STRING,
      // },
      defaultValue: {
        type: DataType.STRING,
      },

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

