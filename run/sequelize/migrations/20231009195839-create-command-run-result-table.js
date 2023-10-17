'use strict';

var DataType = require('sequelize/lib/data-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CommandRunResult', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true, 
      },
      commandTemplateId: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'CommandTemplate'
          },
          key: 'id'
        },
      },
      parametersJson: {
        type: DataType.STRING(4000),
        allowNull: true,
      },
      runTimeMilliseconds:{
        type: DataType.INTEGER,
        allowNull: false,
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
    return queryInterface.dropTable('CommandRunResult');
  }
};
