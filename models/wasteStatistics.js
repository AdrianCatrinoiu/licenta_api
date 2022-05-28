"use strict";

module.exports = (sequelize, DataTypes) => {
  const WasteStatistics = sequelize.define(
    "WasteStatistics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      material: {
        type: DataTypes.STRING,
      },
      Recycled: {
        type: DataTypes.FLOAT,
      },
      Landfilled: {
        type: DataTypes.FLOAT,
      },
      Combusted: {
        type: DataTypes.FLOAT,
      },
      Composted: {
        type: DataTypes.FLOAT,
      },
      percentileRecycled: {
        type: DataTypes.FLOAT,
      },
      percentileLandfilled: {
        type: DataTypes.FLOAT,
      },
      percentileCombusted: {
        type: DataTypes.FLOAT,
      },
      percentileComposted: {
        type: DataTypes.FLOAT,
      },
    },
    { timestamps: false }
  );

  return WasteStatistics;
};
