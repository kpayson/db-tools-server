'use strict';

const seedData = require('../seed-data.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    for(const report of seedData.dataReports) {

      const r = {
        name: report.name,
        description: report.description,
        reportTemplate: report.reportTemplate.join('\n'),
        customViewId: report.customViewId,
      };

      await queryInterface.bulkInsert('DataReport', [r], {});

      const dataReports = await queryInterface.sequelize.query(
        `SELECT id from DataReport where name='${report.name}';`
      );

      const dataReportRows = dataReports[0];

      const dataReportParameters = report.parameters.map(p => {
        return {...p, dataReportId: dataReportRows[0].id};
      });

      await queryInterface.bulkInsert('DataReportParameter', dataReportParameters,{});

    }
    
  },



  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('DataReport', null, {});
  }
};

