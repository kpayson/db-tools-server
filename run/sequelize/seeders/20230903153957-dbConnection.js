'use strict';

const seedData = require('../seed-data.json');
console.log("seedData=" + seedData);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('DatabaseConnection', seedData.databaseConnections, {});

    for(const template of seedData.commandTemplates) {
      const t = {
        name: template.name,
        template: template.template,
        resultLocationType: template.resultLocationType,
        resultFilePath: template.resultFilePath,
        resultFileType: template.resultFileType,
      };
      await queryInterface.bulkInsert('CommandTemplate', [t], {});

      const commandTemplates = await queryInterface.sequelize.query(
        `SELECT id from CommandTemplate where name='${template.name}';`
      );
      const commandTemplateRows = commandTemplates[0];

      const parameters = template.parameters.map(p => {
        return {...p, commandTemplateId: commandTemplateRows[0].id};
      });

      await queryInterface.bulkInsert('CommandTemplateParameter', parameters,{});
    }

  },



  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DatabaseConnections', null, {});
    await queryInterface.bulkDelete('CommandTemplates', null, {});
    await queryInterface.bulkDelete('PerfTestResults', null, {});
    
  }
};
