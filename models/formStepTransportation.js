"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormStepTransportation = sequelize.define(
    "FormStepTransportation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: DataTypes.STRING,
      vehicleNr: DataTypes.FLOAT,
      fuelUsed: DataTypes.FLOAT,
      fuelUnit: DataTypes.STRING,
      emissionsAmountCO2: DataTypes.FLOAT,
      emissionsAmountCH4: DataTypes.FLOAT,
      emissionsAmountN2O: DataTypes.FLOAT,
    },
    { timestamps: false }
  );
  FormStepTransportation.associate = function (models) {
    FormStepTransportation.belongsTo(models.Form, { foreignKey: "formId" });
  };
  return FormStepTransportation;
};
