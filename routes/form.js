const { authenticateJWT, calculateEmissions } = require("../utils/utils");
const GHGEmissions = require("../db/GHGEmissions.json");
const electricityEmissions = require("../db/electricityEmissions.json");
const wasteEmissions = require("../db/wasteEmissions.json");

module.exports = (app, models) => {
  app.post("/form/add", authenticateJWT, async (req, res) => {
    const data = req.body;

    const user = await models.User.findByPk(req.user.uid);

    let formId = data.data.formId || null;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    if (user) {
      formStep = data.step;
      switch (formStep) {
        case "stepHeating":
          const heating = await models.FormStepHeating.create({
            label: data.data.label,
            value: data.data.value,
            unit: data.data.unit,
            emissionsAmountCO2: 0,
            emissionsAmountCH4: 0,
            emissionsAmountN2O: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: heating.id });

        case "stepWaste":
          const waste = await models.FormStepWaste.create({
            label: data.data.label,
            type: data.data.type,
            value: data.data.value,
            emissionsAmountCO2: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: waste.id });

        case "stepRefrigerants":
          const refrigerants = await models.FormStepRefrigerants.create({
            label: data.data.label,
            kgBegin: data.data.kgBegin,
            kgEnd: data.data.kgEnd,
            formula: data.data.formula,
            emissionsAmountCO2: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: refrigerants.id });

        case "stepTransportation":
          const transportation = await models.FormStepTransportation.create({
            label: data.data.label,
            vehicleNr: data.data.vehicleNr,
            fuelUsed: data.data.fuelUsed,
            fuelUnit: data.data.fuelUnit,
            vehicleType: data.data.vehicleType,
            emissionsAmountCO2: 0,
            emissionsAmountCH4: 0,
            emissionsAmountN2O: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: transportation.id });

        default:
          break;
      }

      res.status(404).send("Incorrect form step");
    }
  });

  app.put("/form/update", authenticateJWT, async (req, res) => {
    const data = req.body;

    const user = await models.User.findByPk(req.user.uid);

    let formId = data.data.formId || null;
    if (user) {
      formStep = data.step;

      switch (formStep) {
        case "stepYear":
          const existingForm = await models.Form.findOne({
            where: {
              userId: user.id,
              year: data.data,
            },
          });
          if (existingForm) {
            formId = existingForm.id;
            return res.status(201).send("Form already exists");
          } else {
            const newForm = await models.Form.create({
              userId: user.id,
              year: data.data,
              CAEN: "",
            });
            formId = newForm.id;
            return res.status(200).send({ formId });
          }

        case "stepCAEN":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          await models.Form.update(
            { CAEN: data.data },
            { where: { id: formId } }
          );
          return res.status(200).send({ formId });

        case "stepElectricity":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const electricity = await models.FormStepElectricity.findOne({
            where: {
              formId: formId,
            },
          });
          if (electricity) {
            let electricityEmission = {};
            const form = await models.Form.findByPk(formId);

            // cautam dupa an in tabel
            electricityEmission = electricityEmissions.find(
              (electricityEmission) =>
                electricityEmission.Country === electricity.country &&
                electricityEmission.Year === form.year &&
                form.year <= 2020
            );

            //daca anul selectat este peste anii din tabel punem ultimul an din tabel
            electricityEmission = electricityEmissions.find(
              (electricityEmission) =>
                electricityEmission.Country === data.data.country &&
                electricityEmission.Year === 2020
            );

            await models.FormStepElectricity.update(
              {
                renewableAmount: data.data.renewableAmount,
                nonRenewableAmount: data.data.nonRenewableAmount,
                country: data.data.country,
                emissionsAmountCO2:
                  (data.data.nonRenewableAmount * electricityEmission.gCO2) /
                  1000,
              },
              { where: { id: electricity.id } }
            );
            return res.status(200).send({
              formId,
              id: electricity.id,
              emissionsAmountCO2:
                (data.data.nonRenewableAmount * electricityEmission.gCO2) /
                1000,
            });
          } else {
            const newElectricity = await models.FormStepElectricity.create({
              renewableAmount: data.data.renewableAmount,
              nonRenewableAmount: 0,
              country: data.data.country,
              emissionsAmountCO2: 0,
              formId: formId,
            });
            return res
              .status(200)
              .send({ formId, id: newElectricity.id, emissionsAmountCO2: 0 });
          }

        case "stepHeating":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const heating = await models.FormStepHeating.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (heating) {
            const heatingEmission = GHGEmissions.find(
              (GHGEmission) => GHGEmission.type === "Burning"
            );
            const heatingEmissionValue = heatingEmission.typeList.find(
              (type) => type.label === data.data.label
            );

            await models.FormStepHeating.update(
              {
                label: data.data.label,
                value: data.data.value,
                unit: data.data.unit,
                emissionsAmountCO2:
                  data.data.value * heatingEmissionValue.CO2value,
                emissionsAmountCH4:
                  data.data.value * heatingEmissionValue.CH4value,
                emissionsAmountN2O:
                  data.data.value * heatingEmissionValue.N2Ovalue,
              },
              {
                where: {
                  id: data.data.id,
                },
              }
            );

            return res.status(200).send({
              formId,
              id: heating.id,
              emissionsAmountCO2:
                data.data.value * heatingEmissionValue.CO2value,
              emissionsAmountCH4:
                data.data.value * heatingEmissionValue.CH4value,
              emissionsAmountN2O:
                data.data.value * heatingEmissionValue.N2Ovalue,
            });
          }
          return res.status(404).send("Item not found");

        case "stepWaste":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const waste = await models.FormStepWaste.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (waste) {
            const wasteEmissionValue = wasteEmissions.find(
              (type) => type.label === data.data.label
            );
            await models.FormStepWaste.update(
              {
                label: data.data.label,
                type: data.data.type,
                value: data.data.value,
                emissionsAmountCO2:
                  data.data.value *
                  (wasteEmissionValue[waste.type] * 1.102) *
                  1000,
              },
              {
                where: {
                  id: waste.id,
                  emissionsAmountCO2:
                    data.data.value *
                    (wasteEmissionValue[waste.type] * 1.102) *
                    1000,
                },
              }
            );
            return res.status(200).send({ formId, id: waste.id });
          }
          return res.status(404).send("Item not found");

        case "stepRefrigerants":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const refrigerants = await models.FormStepRefrigerants.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (refrigerants) {
            const refrigerantEmission = GHGEmissions.find(
              (GHGEmission) => GHGEmission.type === "Refrigerants"
            );
            const refrigerantEmissionValue = refrigerantEmission.typeList.find(
              (type) => type.label === data.data.label
            );

            await models.FormStepRefrigerants.update(
              {
                label: data.data.label,
                kgBegin: data.data.kgBegin,
                kgEnd: data.data.kgEnd,
                formula: data.data.formula,
                emissionsAmountCO2:
                  (data.data.kgBegin - data.data.kgEnd) *
                  refrigerantEmissionValue.GWP,
              },
              {
                where: {
                  id: refrigerants.id,
                },
              }
            );
            return res.status(200).send({
              formId,
              id: refrigerants.id,
              emissionsAmountCO2:
                (data.data.kgBegin - data.data.kgEnd) *
                refrigerantEmissionValue.GWP,
            });
          }
          return res.status(404).send("Item not found");

        case "stepTransportation":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const transportation = await models.FormStepTransportation.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (transportation) {
            const transportEmission = GHGEmissions.find(
              (GHGEmission) => GHGEmission.type === "Transportation"
            );
            const transportEmissionValue = transportEmission.typeList.find(
              (type) => type.label === data.data.label
            );
            await models.FormStepTransportation.update(
              {
                label: data.data.label,
                vehicleNr: data.data.vehicleNr,
                fuelUsed: data.data.fuelUsed,
                fuelUnit: data.data.fuelUnit,
                vehicleType: data.data.vehicleType,
                emissionsAmountCO2:
                  data.data.fuel *
                  data.data.vehicles *
                  transportEmissionValue.CO2value,
                emissionsAmountCH4:
                  data.data.fuel *
                  data.data.vehicles *
                  transportEmissionValue.CH4value,
                emissionsAmountN2O:
                  data.data.fuel *
                  data.data.vehicles *
                  transportEmissionValue.N2Ovalue,
              },
              { where: { id: transportation.id } }
            );
            return res.status(200).send({
              formId,
              id: transportation.id,
              emissionsAmountCO2:
                data.data.fuel *
                data.data.vehicles *
                transportEmissionValue.CO2value,
              emissionsAmountCH4:
                data.data.fuel *
                data.data.vehicles *
                transportEmissionValue.CH4value,
              emissionsAmountN2O:
                data.data.fuel *
                data.data.vehicles *
                transportEmissionValue.N2Ovalue,
            });
          }
          return res.status(404).send("Item not found");

        default:
          break;
      }

      res.status(200).send("Item updated");
    }
  });

  app.delete("/form/delete", authenticateJWT, async (req, res) => {
    const data = req.body;

    const user = await models.User.findByPk(req.user.uid);

    let formId = data.data.formId;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    if (user) {
      formStep = data.step;

      switch (formStep) {
        case "stepHeating":
          const heating = await models.FormStepHeating.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (heating) {
            await models.FormStepHeating.destroy({
              where: { id: heating.id },
            });
            return res.status(200).send("Item deleted");
          }
          return res.status(404).send("Item not found");
        case "stepWaste":
          const waste = await models.FormStepWaste.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (waste) {
            await models.FormStepWaste.destroy({
              where: { id: waste.id },
            });
            return res.status(200).send("Item deleted");
          }
          return res.status(404).send("Item not found");
        case "stepRefrigerants":
          const refrigerants = await models.FormStepRefrigerants.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (refrigerants) {
            await models.FormStepRefrigerants.destroy({
              where: { id: refrigerants.id },
            });
            return res.status(200).send("Item deleted");
          }
          return res.status(404).send("Item not found");
        case "stepTransportation":
          const transportation = await models.FormStepTransportation.findOne({
            where: {
              formId: formId,
              id: data.data.id,
            },
          });
          if (transportation) {
            await models.FormStepTransportation.destroy({
              where: { id: transportation.id },
            });
            return res.status(200).send("Item deleted");
          }
          return res.status(404).send("Item not found");

        default:
          break;
      }

      res.status(401).send("Item not deleted");
    }
  });

  app.post("/form/calculate", authenticateJWT, async (req, res) => {
    const data = req.body;

    const user = await models.User.findByPk(req.user.uid);

    let formId = data.data.formId;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    if (user) {
      const emissions = calculateEmissions();
      res.status(200).json(emissions);
    }
  });
};
