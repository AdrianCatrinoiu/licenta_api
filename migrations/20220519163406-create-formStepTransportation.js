"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("FormStepTransportations", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        label: {
          type: Sequelize.STRING,
        },
        vehicleNr: {
          type: Sequelize.FLOAT,
        },
        fuelUsed: {
          type: Sequelize.FLOAT,
        },
        fuelUnit: {
          type: Sequelize.STRING,
        },
        vehicleType: {
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
    return queryInterface.dropTable("FormStepTransportations");
  },
};
