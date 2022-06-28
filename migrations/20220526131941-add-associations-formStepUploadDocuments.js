"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "FormStepUploadDocuments", // numele modelului de urmat
      "formId", // numele cheii adaugate in tabel
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Forms", // numele modelului catre care se face referinta
          key: "id", // cheia din tabel catre care se face referinta
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "FormStepUploadDocuments", // numele modelului de urmat
      "formId" // numele cheii de scos din tabel
    );
  },
};
