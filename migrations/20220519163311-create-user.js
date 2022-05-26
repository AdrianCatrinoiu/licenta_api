"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("Users", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          required: true,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          required: true,
        },
        companyName: {
          type: Sequelize.STRING,
          required: true,
        },
        userRole: {
          type: Sequelize.STRING,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Users");
  },
};
