"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormStepElectricity = sequelize.define(
    "FormStepElectricity",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      renewableAmount: DataTypes.FLOAT,
      nonRenewableAmount: DataTypes.FLOAT,
      country: DataTypes.STRING,
    },
    { timestamps: false }
  );
  FormStepElectricity.associate = function (models) {
    FormStepElectricity.belongsTo(models.Form, { foreignKey: "formId" });
  };
  return FormStepElectricity;
};
