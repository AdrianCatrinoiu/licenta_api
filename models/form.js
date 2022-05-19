"use strict";

module.exports = (sequelize, DataTypes) => {
  const Form = sequelize.define(
    "Form",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      year: DataTypes.INTEGER,
      CAEN: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  Form.associate = function (models) {
    Form.belongsTo(models.User, { foreignKey: "userId" });
    Form.hasMany(models.FormStepElectricity, {
      foreignKey: "formId",
    });
    Form.hasMany(models.FormStepHeating, {
      foreignKey: "formId",
    });
    Form.hasMany(models.FormStepWaste, {
      foreignKey: "formId",
    });
    Form.hasMany(models.FormStepRefrigerants, {
      foreignKey: "formId",
    });
    Form.hasMany(models.FormStepTransportation, {
      foreignKey: "formId",
    });
  };

  return Form;
};
