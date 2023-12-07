'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('CustomView', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name:{
        type: DataType.STRING,
        allowNull: false,
      },

      description:{
        type: DataType.STRING,
        allowNull: false,
      },

      viewSql:{
        type: DataType.STRING,
        allowNull: false,
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

