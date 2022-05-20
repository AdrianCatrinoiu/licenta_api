"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("FormStepHeatings", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        label: {
          type: Sequelize.STRING,
        },
        value: {
          type: Sequelize.FLOAT,
        },
        unit: {
          type: Sequelize.STRING,
        },
        emissionsAmountCO2: {
          type: Sequelize.FLOAT,
        },
        emissionsAmountCH4: {
          type: Sequelize.FLOAT,
        },
        emissionsAmountN2O: {
          type: Sequelize.FLOAT,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("FormStepHeatings");
  },
};
