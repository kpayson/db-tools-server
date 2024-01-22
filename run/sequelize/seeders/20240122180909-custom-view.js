'use strict';

const seedData = require('../seed-data.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  
  async up (queryInterface, Sequelize) {

    for(const view of seedData.customViews) {
      const v = {
        name: view.name,
        description: view.description,
        viewSql: view.viewSqlLines.join('\n'),
      };

      await queryInterface.bulkInsert('CustomView', [v], {});

      const customViews = await queryInterface.sequelize.query(
        `SELECT id from CustomView where name='${view.name}';`
      );
      const customViewRows = customViews[0];

      const customViewParameters = view.parameters.map(v => {
        return {...v, customViewId: customViewRows[0].id};
      });

      await queryInterface.bulkInsert('CustomViewParameter', customViewParameters,{});
    }
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CustomView', null, {});    
  }
};

