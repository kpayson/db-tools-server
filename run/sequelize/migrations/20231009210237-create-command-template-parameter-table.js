'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CommandTemplateParameter', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },
      commandTemplateId: {
        type:DataType.INTEGER
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
    return queryInterface.dropTable('CommandTemplateParameter');
  }
};
