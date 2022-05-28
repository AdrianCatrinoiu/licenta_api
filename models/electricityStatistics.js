"use strict";

module.exports = (sequelize, DataTypes) => {
  const ElectricityStatistics = sequelize.define(
    "ElectricityStatistics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      country: {
        type: DataTypes.STRING,
      },

      code: {
        type: DataTypes.STRING,
      },
      year: {
        type: DataTypes.STRING,
      },
      gCO2: {
        type: DataTypes.FLOAT,
      },
      gCO2percentile: {
        type: DataTypes.FLOAT,
      },
    },
    { timestamps: false }
  );

  return ElectricityStatistics;
};
