"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("Forms", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        year: {
          type: Sequelize.INTEGER,
        },
        CAEN: {
          type: Sequelize.STRING,
        },
        emissionCO2Total: {
          type: Sequelize.FLOAT,
        },
        emissionBadge: {
          type: Sequelize.STRING,
        },
        uploadedDocuments: {
          type: Sequelize.BOOLEAN,
        },
        adminBadge: {
          type: Sequelize.BOOLEAN,
        },
        updatedAt: {
          type: Sequelize.DATE,
        },
        createdAt: {
          type: Sequelize.DATE,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Forms");
  },
};
