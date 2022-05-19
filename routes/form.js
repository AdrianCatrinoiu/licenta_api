const {
  getData,
  saveData,
  authenticateJWT,
  calculateEmissions,
} = require("../utils/utils");

module.exports = (app, models) => {
  app.post("/form/add", authenticateJWT, (req, res) => {
    const { userId, addData } = req.body;

    const users = getData("../db/users.json");

    const user = users.find((u) => u.id === userId);
    if (user) {
      formStep = addData.step;
      if (Array.isArray(user.formData[formStep])) {
        user.formData[formStep].push(addData.data);
      } else {
        user.formData[formStep] = addData.data;
      }

      saveData(users, "../db/users.json");
      res.status(200).send("Item added");
    }
  });

  app.put("/form/update", authenticateJWT, (req, res) => {
    const { userId, updateData } = req.body;
    const users = getData("../db/users.json");
    const user = users.find((u) => u.id === userId);
    if (user) {
      formStep = updateData.step;
      if (Array.isArray(user.formData[formStep])) {
        user.formData[formStep].map((step, index) => {
          if (step.id === updateData.data.id) {
            user.formData[formStep][index] = updateData.data;
          }
        });
      } else {
        user.formData[formStep] = updateData.data;
      }

      saveData(users, "../db/users.json");
      res.status(200).send("Item updated");
    }
  });

  app.delete("/form/delete", authenticateJWT, (req, res) => {
    const { userId, deleteData } = req.body;
    const users = getData("../db/users.json");
    const user = users.find((u) => u.id === userId);
    if (user) {
      formStep = deleteData.step;
      if (Array.isArray(user.formData[formStep])) {
        user.formData[formStep].filter((step, index) => {
          if (step.id === deleteData.data.id) {
            user.formData[formStep].splice(index, 1);
          }
        });
      } else if (formStep === "stepElectricity") {
        user.formData[formStep] = {};
      } else {
        user.formData[formStep] = formStep === "stepYear" ? 0 : "";
      }

      saveData(users, "../db/users.json");
      res.status(200).send("Item deleted");
    }
  });

  app.post("/form/calculate", authenticateJWT, (req, res) => {
    const { userId, formData } = req.body;
    const users = getData("../db/users.json");
    const user = users.find((u) => u.id === userId);
    if (user) {
      const emissions = calculateEmissions(user.formData);
      console.log("emissions", emissions);
      res.status(200).json(emissions);
    }
  });
};
