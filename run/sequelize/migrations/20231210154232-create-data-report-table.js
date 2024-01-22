'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('DataReport', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataType.STRING,
        allowNull: false,
      },

      description: {
        type: DataType.STRING,
        allowNull: false,
      },

      reportTemplate: {
        type: DataType.STRING(4000),
        allowNull: false,
      },


      customViewId: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomView',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }

    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};


