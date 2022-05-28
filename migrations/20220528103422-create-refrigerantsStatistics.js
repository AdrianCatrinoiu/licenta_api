"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("RefrigerantsStatistics", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        label: {
          type: Sequelize.STRING,
        },
        formula: {
          type: Sequelize.STRING,
        },
        GWP: {
          type: Sequelize.FLOAT,
        },
        category: {
          type: Sequelize.STRING,
        },
        GWPpercentile: {
          type: Sequelize.FLOAT,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("RefrigerantsStatistics");
  },
};
