"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("FormStepUploadDocuments", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        step: {
          type: Sequelize.STRING,
        },
        file: {
          type: Sequelize.STRING,
        },
      });
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("FormStepUploadDocuments");
  },
};
