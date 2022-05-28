"use strict";

module.exports = (sequelize, DataTypes) => {
  const RefrigerantsStatistics = sequelize.define(
    "RefrigerantsStatistics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: {
        type: DataTypes.STRING,
      },
      formula: {
        type: DataTypes.STRING,
      },
      GWP: {
        type: DataTypes.FLOAT,
      },
      category: {
        type: DataTypes.STRING,
      },
      GWPpercentile: {
        type: DataTypes.FLOAT,
      },
    },
    { timestamps: false }
  );

  return RefrigerantsStatistics;
};
