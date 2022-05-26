const { authenticateJWT, calculateEmissions } = require("../utils/utils");
const GHGEmissions = require("../db/GHGEmissions.json");
const electricityEmissions = require("../db/electricityEmissions.json");
const wasteEmissions = require("../db/wasteEmissions.json");

module.exports = (app, models) => {
  app.post("/form/add", authenticateJWT, async (req, res) => {
    const data = req.body;

    const user = await models.User.findByPk(req.user.uid);

    let formId = data.data.formId ? data.data.formId : null;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    if (user) {
      formStep = data.data.step;
      switch (formStep) {
        case "stepHeating":
          const heating = await models.FormStepHeating.create({
            label: data.data.data.label,
            value: data.data.data.value,
            unit: data.data.data.unit,
            emissionsAmountCO2: 0,
            emissionsAmountCH4: 0,
            emissionsAmountN2O: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: heating.id });

        case "stepWaste":
          const waste = await models.FormStepWaste.create({
            label: data.data.data.label,
            type: data.data.data.type,
            value: data.data.data.value,
            emissionsAmountCO2: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: waste.id });

        case "stepRefrigerants":
          const refrigerants = await models.FormStepRefrigerants.create({
            label: data.data.data.label,
            kgBegin: data.data.data.kgBegin,
            kgEnd: data.data.data.kgEnd,
            formula: data.data.data.formula,
            emissionsAmountCO2: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: refrigerants.id });

        case "stepTransportation":
          const transportation = await models.FormStepTransportation.create({
            label: data.data.data.label,
            vehicleNr: data.data.data.vehicleNr,
            fuelUsed: data.data.data.fuelUsed,
            fuelUnit: data.data.data.fuelUnit,
            vehicleType: data.data.data.vehicleType,
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
    let formId = data.data.formId ? data.data.formId : null;
    if (user) {
      formStep = data.data.step;
      switch (formStep) {
        case "stepYear":
          const existingForm = await models.Form.findOne({
            where: {
              userId: user.dataValues.id,
              year: data.data.data,
            },
          });
          if (existingForm) {
            formId = existingForm.dataValues.id;
            let formData = {
              formId: formId,
              stepYear: data.data.data,
              stepCAEN: existingForm.dataValues.CAEN,
              stepElectricity: {
                renewableAmount: 0,
                nonRenewableAmount: 0,
                country: "",
                emissionsAmountCO2: 0,
              },
              stepHeating: [],
              stepWaste: [],
              stepRefrigerants: [],
              stepTransportation: [],
            };
            let stepElectricity = await models.FormStepElectricity.findOne({
              where: {
                formId: formId,
              },
            });
            if (!stepElectricity) {
              const newElectricity = await models.FormStepElectricity.create({
                formId: formId,
                renewableAmount: null,
                nonRenewableAmount: null,
                country: "",
                emissionsAmountCO2: 0,
              });
              stepElectricity = newElectricity.dataValues;
            }

            const stepHeating = await models.FormStepHeating.findAll({
              where: {
                formId: formId,
              },
            });
            const stepWaste = await models.FormStepWaste.findAll({
              where: {
                formId: formId,
              },
            });
            const stepRefrigerants = await models.FormStepRefrigerants.findAll({
              where: {
                formId: formId,
              },
            });
            const stepTransportation =
              await models.FormStepTransportation.findAll({
                where: {
                  formId: formId,
                },
              });
            formData.stepHeating = stepHeating;
            formData.stepWaste = stepWaste;
            formData.stepRefrigerants = stepRefrigerants;
            formData.stepTransportation = stepTransportation;
            formData.stepElectricity = stepElectricity;
            return res.status(201).json(formData);
          } else {
            const newForm = await models.Form.create({
              userId: user.dataValues.id,
              year: data.data.data,
              emissionCO2Total: 0,
              emissionBadge: "",
              uploadedDocuments: false,
              adminBadge: false,
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
            { CAEN: data.data.data },
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
                electricityEmission.Country ===
                  electricity.dataValues.country &&
                electricityEmission.Year === form.year &&
                form.year <= 2020
            );
            //daca anul selectat este peste anii din tabel punem ultimul an din tabel
            electricityEmission = electricityEmissions.find(
              (electricityEmission) =>
                electricityEmission.Country === data.data.data.country &&
                electricityEmission.Year === 2020
            );
            await models.FormStepElectricity.update(
              {
                renewableAmount: data.data.data.renewableAmount,
                nonRenewableAmount: data.data.data.nonRenewableAmount,
                country: data.data.data.country,
                emissionsAmountCO2:
                  (data.data.data.nonRenewableAmount *
                    electricityEmission.gCO2) /
                  1000,
              },
              { where: { id: electricity.id } }
            );
            return res.status(200).send({
              formId,
              emissions: {
                emissionsAmountCO2:
                  (data.data.data.nonRenewableAmount *
                    electricityEmission.gCO2) /
                  1000,
              },
            });
          } else {
            await models.FormStepElectricity.create({
              renewableAmount: data.data.data.renewableAmount,
              nonRenewableAmount: 0,
              country: data.data.data.country,
              emissionsAmountCO2: 0,
              formId: formId,
            });
            return res
              .status(200)
              .send({ formId, emissions: { emissionsAmountCO2: 0 } });
          }

        case "stepHeating":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const heating = await models.FormStepHeating.findOne({
            where: {
              formId: formId,
              id: data.data.data.id,
            },
          });
          if (heating) {
            const heatingEmission = GHGEmissions.find(
              (GHGEmission) => GHGEmission.type === "Burning"
            );
            const heatingEmissionValue = heatingEmission.typeList.find(
              (type) => type.label === data.data.data.label
            );

            await models.FormStepHeating.update(
              {
                label: data.data.data.label,
                value: data.data.data.value,
                unit: data.data.data.unit,
                emissionsAmountCO2:
                  data.data.data.value * heatingEmissionValue.CO2value,
                emissionsAmountCH4:
                  data.data.data.value * heatingEmissionValue.CH4value,
                emissionsAmountN2O:
                  data.data.data.value * heatingEmissionValue.N2Ovalue,
              },
              {
                where: {
                  id: data.data.data.id,
                },
              }
            );

            return res.status(200).send({
              formId,
              id: heating.id,
              emissions: {
                emissionsAmountCO2:
                  data.data.data.value * heatingEmissionValue.CO2value,
                emissionsAmountCH4:
                  data.data.data.value * heatingEmissionValue.CH4value,
                emissionsAmountN2O:
                  data.data.data.value * heatingEmissionValue.N2Ovalue,
              },
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
              id: data.data.data.id,
            },
          });
          if (waste) {
            const wasteEmissionValue = wasteEmissions.find(
              (type) => type.label === data.data.data.label
            );

            await models.FormStepWaste.update(
              {
                label: data.data.data.label,
                type: data.data.data.type,
                value: data.data.data.value,
                emissionsAmountCO2:
                  data.data.data.value *
                  (wasteEmissionValue[waste.type] * 1.102) *
                  1000,
              },
              {
                where: {
                  id: waste.id,
                },
              }
            );
            return res.status(200).send({
              formId,
              id: waste.id,
              emissions: {
                emissionsAmountCO2:
                  data.data.data.value *
                  (wasteEmissionValue[waste.type] * 1.102) *
                  1000,
              },
            });
          }
          return res.status(404).send("Item not found");

        case "stepRefrigerants":
          if (!formId) {
            return res.status(404).send("Form not found");
          }
          const refrigerants = await models.FormStepRefrigerants.findOne({
            where: {
              formId: formId,
              id: data.data.data.id,
            },
          });
          if (refrigerants) {
            const refrigerantEmission = GHGEmissions.find(
              (GHGEmission) => GHGEmission.type === "Refrigerants"
            );
            const refrigerantEmissionValue = refrigerantEmission.typeList.find(
              (type) => type.label === data.data.data.label
            );
            await models.FormStepRefrigerants.update(
              {
                label: data.data.data.label,
                kgBegin: data.data.data.kgBegin,
                kgEnd: data.data.data.kgEnd,
                formula: data.data.data.formula,
                emissionsAmountCO2:
                  (data.data.data.kgBegin - data.data.data.kgEnd) *
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
              emissions: {
                emissionsAmountCO2:
                  (data.data.data.kgBegin - data.data.data.kgEnd) *
                  refrigerantEmissionValue.GWP,
              },
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
              id: data.data.data.id,
            },
          });
          if (transportation) {
            const transportEmission = GHGEmissions.find(
              (GHGEmission) => GHGEmission.type === "Transportation"
            );
            const transportEmissionValue = transportEmission.typeList.find(
              (type) => type.label === data.data.data.label
            );

            if (data.data.data.fuelUnit === "litres") {
              const emissionsAmountCO2 =
                data.data.data.fuelUsed *
                0.2641722 *
                transportEmissionValue.CO2value;
              const emissionsAmountCH4 =
                data.data.data.fuelUsed *
                0.2641722 *
                transportEmissionValue.CH4value;
              const emissionsAmountN2O =
                data.data.data.fuelUsed *
                0.2641722 *
                transportEmissionValue.N2Ovalue;
              await models.FormStepTransportation.update(
                {
                  label: data.data.data.label,
                  vehicleNr: data.data.data.vehicleNr,
                  fuelUsed: data.data.data.fuelUsed,
                  fuelUnit: data.data.data.fuelUnit,
                  vehicleType: data.data.data.vehicleType,
                  emissionsAmountCO2: emissionsAmountCO2,
                  emissionsAmountCH4: emissionsAmountCH4,
                  emissionsAmountN2O: emissionsAmountN2O,
                },
                { where: { id: transportation.id } }
              );
              return res.status(200).send({
                formId,
                id: transportation.id,
                emissions: {
                  emissionsAmountCO2: emissionsAmountCO2,
                  emissionsAmountCH4: emissionsAmountCH4,
                  emissionsAmountN2O: emissionsAmountN2O,
                },
              });
            }
            if (data.data.data.fuelUnit === "m³") {
              const emissionsAmountCO2 =
                data.data.data.fuelUsed *
                0.0283168 *
                transportEmissionValue.CO2value;
              const emissionsAmountCH4 =
                data.data.data.fuelUsed *
                0.0283168 *
                transportEmissionValue.CH4value;
              const emissionsAmountN2O =
                data.data.data.fuelUsed *
                0.0283168 *
                transportEmissionValue.N2Ovalue;
              await models.FormStepTransportation.update(
                {
                  label: data.data.data.label,
                  vehicleNr: data.data.data.vehicleNr,
                  fuelUsed: data.data.data.fuelUsed,
                  fuelUnit: data.data.data.fuelUnit,
                  vehicleType: data.data.data.vehicleType,
                  emissionsAmountCO2: emissionsAmountCO2,
                  emissionsAmountCH4: emissionsAmountCH4,
                  emissionsAmountN2O: emissionsAmountN2O,
                },
                { where: { id: transportation.id } }
              );
              return res.status(200).send({
                formId,
                id: transportation.id,
                emissions: {
                  emissionsAmountCO2: emissionsAmountCO2,
                  emissionsAmountCH4: emissionsAmountCH4,
                  emissionsAmountN2O: emissionsAmountN2O,
                },
              });
            }
          }
          return res.status(404).send("Item not found");

        default:
          break;
      }

      res.status(401).send("Item error");
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
      formStep = data.data.step;
      switch (formStep) {
        case "stepHeating":
          const heating = await models.FormStepHeating.findOne({
            where: {
              formId: formId,
              id: data.data.data.id,
            },
          });
          if (heating) {
            await models.FormStepHeating.destroy({
              where: { id: heating.id },
            });
            return res.status(200).send({ formId, id: data.data.data.id });
          }
          return res.status(404).send("Item not found");
        case "stepWaste":
          const waste = await models.FormStepWaste.findOne({
            where: {
              formId: formId,
              id: data.data.data.id,
            },
          });
          if (waste) {
            await models.FormStepWaste.destroy({
              where: { id: waste.id },
            });
            return res.status(200).send({ formId, id: waste.id });
          }
          return res.status(404).send("Item not found");
        case "stepRefrigerants":
          const refrigerants = await models.FormStepRefrigerants.findOne({
            where: {
              formId: formId,
              id: data.data.data.id,
            },
          });
          if (refrigerants) {
            await models.FormStepRefrigerants.destroy({
              where: { id: refrigerants.id },
            });
            return res.status(200).send({ formId, id: refrigerants.id });
          }
          return res.status(404).send("Item not found");
        case "stepTransportation":
          const transportation = await models.FormStepTransportation.findOne({
            where: {
              formId: formId,
              id: data.data.data.id,
            },
          });
          if (transportation) {
            await models.FormStepTransportation.destroy({
              where: { id: transportation.id },
            });
            return res.status(200).send({ formId, id: transportation.id });
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
      const emissions = calculateEmissions(data.data);
      console.log("emissions", emissions);
      return res.status(200).json(emissions);
    }

    return res.status(404).send("User not found");
  });

  app.post("/form/rankings", authenticateJWT, async (req, res) => {
    const { filters } = req.body;
    let filterStatement = {
      where: {},
      order: [],
    };

    if (filters.sortType.label === "Emissions descending") {
      filterStatement.order = [["emissionCO2Total", "DESC"]];
    }
    if (filters.sortType.label === "Emissions ascending") {
      filterStatement.order = [["emissionCO2Total", "ASC"]];
    }
    if (filters.sortType.label === "Year descending") {
      filterStatement.order = [["year", "DESC"]];
    }
    if (filters.sortType.label === "Year ascending") {
      filterStatement.order = [["year", "ASC"]];
    }
    if (filters.year) {
      filterStatement.where = {
        ...filterStatement.where,
        year: filters.year,
      };
    }
    if (filters.CAEN) {
      filterStatement.where = {
        ...filterStatement.where,
        CAEN: filters.CAEN.value,
      };
    }
    //get all forms
    const allForms = await models.Form.findAll({
      limit: 10,
      where: filterStatement.where,
      order: filterStatement.order,
    });
    const emissionsList = await Promise.all(
      allForms.map(async (formData) => {
        const user = await models.User.findOne({
          where: {
            id: formData.userId,
          },
        });

        const stepYear = formData.dataValues.year;
        const stepCAEN = formData.dataValues.CAEN;
        const stepElectricity = await models.FormStepElectricity.findOne({
          where: { formId: formData.dataValues.id },
        });
        const stepHeating = await models.FormStepHeating.findAll({
          where: { formId: formData.dataValues.id },
        });
        const stepWaste = await models.FormStepWaste.findAll({
          where: { formId: formData.dataValues.id },
        });
        const stepRefrigerants = await models.FormStepRefrigerants.findAll({
          where: { formId: formData.dataValues.id },
        });
        const stepTransportation = await models.FormStepTransportation.findAll({
          where: { formId: formData.dataValues.id },
        });
        return {
          formId: formData.dataValues.id,
          year: stepYear,
          companyName: user.companyName,
          emissions: {
            ...calculateEmissions({
              stepYear,
              stepCAEN,
              stepElectricity,
              stepHeating,
              stepWaste,
              stepRefrigerants,
              stepTransportation,
            }),
          },
        };
      })
    );

    return res.status(200).json(emissionsList);

    return res.status(404).send("Filters not found");
  });
};
