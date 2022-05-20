"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "FormStepWastes", // name of Source model
      "formId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Forms", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "FormStepWastes", // name of Source model
      "formId" // key we want to remove
    );
  },
};
