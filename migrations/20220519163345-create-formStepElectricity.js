"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("FormStepElectricity", {
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
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("FormStepElectricity");
  },
};
