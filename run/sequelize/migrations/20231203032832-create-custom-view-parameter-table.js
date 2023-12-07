'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('CustomViewParameter', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },
      customViewId: {
        type:DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomView',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: DataType.STRING,
      },
      dataType:{
        type: DataType.STRING,
      },
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
