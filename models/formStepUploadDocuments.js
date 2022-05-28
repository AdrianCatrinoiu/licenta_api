"use strict";

module.exports = (sequelize, DataTypes) => {
  const FormStepUploadDocuments = sequelize.define(
    "FormStepUploadDocuments",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      step: DataTypes.STRING,
      file: DataTypes.STRING,
    },
    { timestamps: false }
  );

  FormStepUploadDocuments.associate = function (models) {
    FormStepUploadDocuments.belongsTo(models.Form, { foreignKey: "formId" });
  };
  return FormStepUploadDocuments;
};
