"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("TransportationStatistics", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        label: {
          type: Sequelize.STRING,
        },
        CO2value: {
          type: Sequelize.FLOAT,
        },
        CH4value: {
          type: Sequelize.FLOAT,
        },
        N2Ovalue: {
          type: Sequelize.FLOAT,
        },
        unit: {
          type: Sequelize.STRING,
        },
        CO2percentile: {
          type: Sequelize.FLOAT,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("TransportationStatistics");
  },
};
