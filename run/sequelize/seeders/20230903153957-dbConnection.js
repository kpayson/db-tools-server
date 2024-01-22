'use strict';

const seedData = require('../seed-data.json');
console.log("seedData=" + seedData);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('DatabaseConnection', seedData.databaseConnections, {});
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DatabaseConnection', null, {});
  }
};

