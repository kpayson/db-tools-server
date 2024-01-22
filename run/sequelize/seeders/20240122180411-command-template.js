'use strict';

const seedData = require('../seed-data.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

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

      const commandTemplateParameters = template.parameters.map(p => {
        return {...p, commandTemplateId: commandTemplateRows[0].id};
      });

      await queryInterface.bulkInsert('CommandTemplateParameter', commandTemplateParameters,{});
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CommandTemplate', null, {});    
  }
};
