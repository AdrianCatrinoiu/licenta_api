"use strict";

module.exports = (sequelize, DataTypes) => {
  const TransportationStatistics = sequelize.define(
    "TransportationStatistics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: {
        type: DataTypes.STRING,
      },
      CO2value: {
        type: DataTypes.FLOAT,
      },
      CH4value: {
        type: DataTypes.FLOAT,
      },
      N2Ovalue: {
        type: DataTypes.FLOAT,
      },
      unit: {
        type: DataTypes.STRING,
      },
      CO2percentile: {
        type: DataTypes.FLOAT,
      },
    },
    { timestamps: false }
  );

  return TransportationStatistics;
};
