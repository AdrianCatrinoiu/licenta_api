"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("").then(() => {
      return queryInterface.createTable("WasteStatistics", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        material: {
          type: Sequelize.STRING,
        },
        Recycled: {
          type: Sequelize.FLOAT,
        },
        Landfilled: {
          type: Sequelize.FLOAT,
        },
        Combusted: {
          type: Sequelize.FLOAT,
        },
        Composted: {
          type: Sequelize.FLOAT,
        },
        percentileRecycled: {
          type: Sequelize.FLOAT,
        },
        percentileLandfilled: {
          type: Sequelize.FLOAT,
        },
        percentileCombusted: {
          type: Sequelize.FLOAT,
        },
        percentileComposted: {
          type: Sequelize.FLOAT,
        },
      });
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("WasteStatistics");
  },
};
