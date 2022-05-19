"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormStepHeating = sequelize.define(
    "FormStepHeating",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: DataTypes.STRING,
      value: DataTypes.FLOAT,
      unit: DataTypes.STRING,
      emissionsAmountCO2: DataTypes.FLOAT,
      emissionsAmountCH4: DataTypes.FLOAT,
      emissionsAmountN2O: DataTypes.FLOAT,
    },
    { timestamps: false }
  );

  FormStepHeating.associate = function (models) {
    FormStepHeating.belongsTo(models.Form, { foreignKey: "formId" });
  };
  return FormStepHeating;
};
