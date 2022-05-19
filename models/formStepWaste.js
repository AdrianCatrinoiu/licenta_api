"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormStepWaste = sequelize.define(
    "FormStepWaste",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      label: DataTypes.STRING,
      type: DataTypes.STRING,
      value: DataTypes.FLOAT,
      emissionsAmountCO2: DataTypes.FLOAT,
    },
    {}
  );
  FormStepWaste.associate = function (models) {
    FormStepWaste.belongsTo(models.Form, { foreignKey: "formId" });
  };
  return FormStepWaste;
};
