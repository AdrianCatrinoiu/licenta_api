"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormStepRefrigerants = sequelize.define(
    "FormStepRefrigerants",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: DataTypes.STRING,
      kgBegin: DataTypes.FLOAT,
      kgEnd: DataTypes.FLOAT,
      formula: DataTypes.STRING,
      emissionsAmountCO2: DataTypes.FLOAT,
    },
    { timestamps: false }
  );
  FormStepRefrigerants.associate = function (models) {
    FormStepRefrigerants.belongsTo(models.Form, { foreignKey: "formId" });
  };
  return FormStepRefrigerants;
};
