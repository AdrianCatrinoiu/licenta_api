"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("ElectricityStatistics", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        country: {
          type: Sequelize.STRING,
        },

        code: {
          type: Sequelize.STRING,
        },
        year: {
          type: Sequelize.STRING,
        },
        gCO2: {
          type: Sequelize.FLOAT,
        },
        gCO2percentile: {
          type: Sequelize.FLOAT,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("ElectricityStatistics");
  },
};
