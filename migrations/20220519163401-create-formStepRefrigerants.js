"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("FormStepRefrigerants", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        label: {
          type: Sequelize.STRING,
        },
        kgBegin: {
          type: Sequelize.FLOAT,
        },
        kgEnd: {
          type: Sequelize.FLOAT,
        },
        formula: {
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
    return queryInterface.dropTable("FormStepRefrigerants");
  },
};
