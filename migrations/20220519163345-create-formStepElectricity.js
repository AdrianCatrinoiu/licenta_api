"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("FormStepElectricities", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        renewableAmount: {
          type: Sequelize.FLOAT,
        },
        nonRenewableAmount: {
          type: Sequelize.FLOAT,
        },
        country: {
          type: Sequelize.STRING,
        },
        emissionsAmountCO2: {
          type: Sequelize.FLOAT,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("FormStepElectricities");
  },
};
