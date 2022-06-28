const {
  authenticateJWT,
  calculateEmissions,
  calculateEmissionBadge,
} = require("../utils/utils");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
module.exports = (app, models) => {
  app.use(fileUpload());

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
            emissionsAmountCO2: 0,
            emissionsAmountCH4: 0,
            emissionsAmountN2O: 0,
            formId: formId,
          });
          return res.status(201).json({ formId, id: transportation.id });
        case "stepUploadDocuments":
          const uploadDocuments = await models.FormStepUploadDocuments.create({
            step: data.data.data.step,
            file: data.data.data.file,
            formId: formId,
          });
          return res.status(201).json({ formId, id: uploadDocuments.id });
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
                renewableAmount: null,
                nonRenewableAmount: null,
                country: "",
                emissionsAmountCO2: 0,
              },
              stepHeating: [],
              stepWaste: [],
              stepRefrigerants: [],
              stepTransportation: [],
              stepUploadDocuments: [],
              adminBadge: "",
              emissionBadge: "",
            };
            let foundStepElectricity = await models.FormStepElectricity.findOne(
              {
                where: {
                  formId: formId,
                },
              }
            );
            if (foundStepElectricity) {
              formData.stepElectricity = foundStepElectricity.dataValues;
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
            const stepUploadDocuments =
              await models.FormStepUploadDocuments.findAll({
                where: {
                  formId: formId,
                },
              });
            formData.stepHeating = stepHeating;
            formData.stepWaste = stepWaste;
            formData.stepRefrigerants = stepRefrigerants;
            formData.stepTransportation = stepTransportation;
            formData.stepUploadDocuments = stepUploadDocuments;
            return res.status(201).json(formData);
          } else {
            const newForm = await models.Form.create({
              year: data.data.data,
              CAEN: "",
              emissionCO2Total: 0,
              emissionBadge: "",
              uploadedDocuments: false,
              adminBadge: "",
              uuid: uuidv4(),
              userId: user.dataValues.id,
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
            let electricityEmissionValue = {};
            // cautam dupa an in tabel
            if (data.data.data.country) {
              if (data.data.data.year) {
                electricityEmissionValue =
                  await models.ElectricityStatistics.findOne({
                    where: {
                      country: data.data.data.country,
                      year: data.data.data.year,
                    },
                  });
              } else {
                //daca anul selectat este peste anii din tabel punem ultimul an din tabel
                electricityEmissionValue =
                  await models.ElectricityStatistics.findOne({
                    where: {
                      country: data.data.data.country,
                      year: "2020",
                    },
                  });
              }
            }

            await models.FormStepElectricity.update(
              {
                renewableAmount: data.data.data.renewableAmount,
                nonRenewableAmount: data.data.data.nonRenewableAmount,
                country: data.data.data.country,
                emissionsAmountCO2:
                  (data.data.data.nonRenewableAmount *
                    electricityEmissionValue.dataValues.gCO2) /
                  1000000,
              },
              { where: { id: electricity.id } }
            );
            return res.status(200).send({
              formId,
              emissions: {
                emissionsAmountCO2:
                  (data.data.data.nonRenewableAmount *
                    electricityEmissionValue.dataValues.gCO2) /
                  1000000,
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
            const heatingEmissionValue = await models.BurningStatistics.findOne(
              {
                where: {
                  label: data.data.data.label,
                },
              }
            );
            await models.FormStepHeating.update(
              {
                label: data.data.data.label,
                value: data.data.data.value,
                unit: data.data.data.unit,
                emissionsAmountCO2:
                  data.data.data.value *
                  heatingEmissionValue.dataValues.CO2value,
                emissionsAmountCH4:
                  data.data.data.value *
                  heatingEmissionValue.dataValues.CH4value,
                emissionsAmountN2O:
                  data.data.data.value *
                  heatingEmissionValue.dataValues.N2Ovalue,
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
                  data.data.data.value *
                  heatingEmissionValue.dataValues.CO2value,
                emissionsAmountCH4:
                  data.data.data.value *
                  heatingEmissionValue.dataValues.CH4value,
                emissionsAmountN2O:
                  data.data.data.value *
                  heatingEmissionValue.dataValues.N2Ovalue,
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
            const wasteEmissionValue = await models.WasteStatistics.findOne({
              where: {
                material: data.data.data.label,
              },
            });

            await models.FormStepWaste.update(
              {
                label: data.data.data.label,
                type: data.data.data.type,
                value: data.data.data.value,
                emissionsAmountCO2:
                  data.data.data.value * wasteEmissionValue[waste.type] * 1000,
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
                  data.data.data.value * wasteEmissionValue[waste.type] * 1000,
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
            const refrigerantEmissionValue =
              await models.RefrigerantsStatistics.findOne({
                where: {
                  label: data.data.data.label,
                },
              });
            await models.FormStepRefrigerants.update(
              {
                label: data.data.data.label,
                kgBegin: data.data.data.kgBegin,
                kgEnd: data.data.data.kgEnd,
                formula: data.data.data.formula,
                emissionsAmountCO2:
                  (data.data.data.kgBegin - data.data.data.kgEnd) *
                  refrigerantEmissionValue.dataValues.GWP,
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
                  refrigerantEmissionValue.dataValues.GWP,
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
            console.log(data.data.data.label);
            const transportEmissionValue =
              await models.TransportationStatistics.findOne({
                where: {
                  label: data.data.data.label,
                },
              });
            console.log(transportEmissionValue);
            const emissionsAmountCO2 =
              data.data.data.fuelUsed *
              transportEmissionValue.dataValues.CO2value;
            const emissionsAmountCH4 =
              data.data.data.fuelUsed *
              transportEmissionValue.dataValues.CH4value;
            const emissionsAmountN2O =
              data.data.data.fuelUsed *
              transportEmissionValue.dataValues.N2Ovalue;
            await models.FormStepTransportation.update(
              {
                label: data.data.data.label,
                vehicleNr: data.data.data.vehicleNr,
                fuelUsed: data.data.data.fuelUsed,
                fuelUnit: data.data.data.fuelUnit,
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
          return res.status(404).send("Item not found");

        default:
          break;
      }

      res.status(401).send("Item error");
    }
  });

  app.delete("/form/delete", authenticateJWT, async (req, res) => {
    const data = req.body;

    let formId = data.data.formId;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
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

      case "stepUploadDocuments":
        const uploadDocument = await models.FormStepUploadDocuments.findOne({
          where: {
            formId: formId,
            id: data.data.data.id,
          },
        });

        if (uploadDocument) {
          await models.FormStepUploadDocuments.destroy({
            where: { id: uploadDocument.id },
          });
          if (uploadDocument.file) {
            fs.unlink(
              path.resolve(__dirname, `..${uploadDocument.file}`),
              function () {
                console.log(
                  "deleted: " +
                    JSON.stringify(
                      path.resolve(__dirname, `..${uploadDocument.file}`)
                    )
                );
              }
            );
          }
          return res.status(200).send({ formId, id: uploadDocument.id });
        }
        return res.status(404).send("Item not found");
      default:
        break;
    }

    res.status(401).send("Item not deleted");
  });

  app.post("/form/calculate", authenticateJWT, async (req, res) => {
    const data = req.body;

    const user = await models.User.findByPk(req.user.uid);
    let formId = data.data.formId;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    if (user) {
      const form = await models.Form.findOne({
        where: {
          id: formId,
          userId: user.id,
        },
      });
      if (form) {
        const emissions = await calculateEmissions(data.data, models);
        const emissionBadge = await calculateEmissionBadge(
          data.data,
          emissions,
          models
        );
        console.log("emissionBadge", emissionBadge);
        await models.Form.update(
          {
            emissionBadge: emissionBadge,
          },
          { where: { id: formId } }
        );
        await models.Form.update(
          {
            emissionCO2Total:
              emissions.electricity.CO2 +
              emissions.heating.CO2 +
              emissions.waste.CO2 +
              emissions.refrigerants.CO2 +
              emissions.transportation.CO2,
          },
          { where: { id: form.id } }
        );
        return res.status(200).json({
          adminBadge: form.dataValues.adminBadge,
          emissionBadge: emissionBadge,
          ...emissions,
        });
      }
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
        const adminBadge = formData.dataValues.adminBadge;
        const emissionBadge = formData.dataValues.emissionBadge;
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
        const uuid = formData.dataValues.uuid;

        return {
          formId: formData.dataValues.id,
          year: stepYear,
          companyName: user.companyName,
          adminBadge: adminBadge,
          emissionBadge: emissionBadge,
          uuid: uuid,
          emissions: {
            ...(await calculateEmissions(
              {
                stepYear,
                stepCAEN,
                stepElectricity,
                stepHeating,
                stepWaste,
                stepRefrigerants,
                stepTransportation,
              },
              models
            )),
          },
        };
      })
    );

    return res.status(200).json(emissionsList);
  });

  app.post("/form/uploadDocuments", authenticateJWT, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(403).send("No files were uploaded.");
    }
    const data = req.body;
    const file = req.files.file;
    const fileName = file.name;
    let formId = data.formId;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    const form = await models.Form.findOne({
      where: {
        id: formId,
      },
    });
    if (form) {
      await file.mv(path.resolve(__dirname, "../uploads/", fileName));

      const uploadDocuments = await models.FormStepUploadDocuments.findOne({
        where: {
          formId: formId,
          id: data.id,
        },
      });
      if (uploadDocuments) {
        await models.FormStepUploadDocuments.update(
          {
            step: data.step,
            file: `/uploads/${fileName}`,
          },
          {
            where: { id: uploadDocuments.id },
          }
        );
        await models.Form.update(
          {
            adminBadge: "pending",
            uploadedDocuments: true,
          },
          {
            where: { id: formId },
          }
        );
        return res.status(200).send({ formId, id: uploadDocuments.id });
      }
      return res.status(404).send("Item not found");
    }
    res.status(401).send("Item not uploaded");
  });

  app.get("/form/getForms", authenticateJWT, async (req, res) => {
    const user = await models.User.findByPk(req.user.uid);

    if (user) {
      //check if user is admin
      if (user.userRole === "admin") {
        const formsNotVerified = await models.Form.findAll({
          where: {
            adminBadge: {
              [Op.eq]: "pending",
            },
          },
        });
        const allFormsData = await Promise.all(
          formsNotVerified.map(async (userForm) => {
            const user = await models.User.findOne({
              where: {
                id: userForm.userId,
              },
            });
            let formData = {
              formId: null,
              stepYear: 0,
              stepCAEN: "",
              stepElectricity: {},
              stepHeating: [],
              stepWaste: [],
              stepRefrigerants: [],
              stepTransportation: [],
              stepUploadDocuments: [],
              adminBadge: "",
              emissionBadge: "",
            };
            formData.formId = userForm.id;
            formData.stepYear = userForm.year;
            formData.stepCAEN = userForm.CAEN;
            formData.adminBadge = userForm.adminBadge;
            formData.emissionBadge = userForm.emissionBadge;
            formData.stepElectricity = await models.FormStepElectricity.findOne(
              {
                where: { formId: userForm.dataValues.id },
              }
            );
            formData.stepHeating = await models.FormStepHeating.findAll({
              where: { formId: userForm.dataValues.id },
            });
            formData.stepWaste = await models.FormStepWaste.findAll({
              where: { formId: userForm.dataValues.id },
            });
            formData.stepRefrigerants =
              await models.FormStepRefrigerants.findAll({
                where: { formId: userForm.dataValues.id },
              });
            formData.stepTransportation =
              await models.FormStepTransportation.findAll({
                where: { formId: userForm.dataValues.id },
              });
            formData.stepUploadDocuments =
              await models.FormStepUploadDocuments.findAll({
                where: { formId: userForm.dataValues.id },
              });
            formData.stepUploadDocuments.forEach((doc) => {
              doc.dataValues.file = doc.dataValues.file.replace(
                "/uploads/",
                ""
              );
            });
            return { user: { ...user.dataValues }, formData: { ...formData } };
          })
        );

        return res.status(200).json(allFormsData);
      }
      return res.status(401).send("Unauthorized");
    }
  });

  app.post("/form/verifyDocuments", authenticateJWT, async (req, res) => {
    const data = req.body;
    let formId = data.verdict.formId;
    if (!formId) {
      return res.status(404).send("Form not found");
    }
    const form = await models.Form.findOne({
      where: {
        id: formId,
      },
    });
    if (form) {
      if (data.verdict.verdict === "verified") {
        await models.Form.update(
          {
            adminBadge: "verified",
          },
          {
            where: { id: formId },
          }
        );
        return res.status(200).send({ formId, verdict: form.verdict });
      } else {
        await models.Form.update(
          {
            adminBadge: "rejected",
          },
          {
            where: { id: formId },
          }
        );
        return res.status(200).send({ formId, verdict: form.verdict });
      }
    }
    res.status(401).send("Item not updated");
  });

  app.get("/form/getEmissionsList", authenticateJWT, async (req, res) => {
    const user = await models.User.findByPk(req.user.uid);
    if (user) {
      //check if user is admin

      const allUserFormsData = await models.Form.findAll({
        where: {
          userId: user.id,
        },
      });
      const emissionsList = await Promise.all(
        allUserFormsData.map(async (formData) => {
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
          const stepTransportation =
            await models.FormStepTransportation.findAll({
              where: { formId: formData.dataValues.id },
            });
          const uuid = formData.dataValues.uuid;

          return {
            formId: formData.dataValues.id,
            year: stepYear,
            adminBadge: formData.dataValues.adminBadge,
            emissionBadge: formData.dataValues.emissionBadge,
            uuid: uuid,
            emissions: {
              ...(await calculateEmissions(
                {
                  stepYear,
                  stepCAEN,
                  stepElectricity,
                  stepHeating,
                  stepWaste,
                  stepRefrigerants,
                  stepTransportation,
                },
                models
              )),
            },
          };
        })
      );

      return res.status(200).json(emissionsList);
    }
    return res.status(401).send("Unauthorized");
  });

  app.get("/form/share/:formUuid", async (req, res) => {
    const formUuid = req.params.formUuid;
    const form = await models.Form.findOne({
      where: {
        uuid: formUuid,
      },
    });
    const user = await models.User.findOne({
      where: {
        id: form.userId,
      },
    });
    if (form) {
      const stepYear = form.dataValues.year;
      const stepCAEN = form.dataValues.CAEN;
      const stepElectricity = await models.FormStepElectricity.findOne({
        where: { formId: form.dataValues.id },
      });
      const stepHeating = await models.FormStepHeating.findAll({
        where: { formId: form.dataValues.id },
      });
      const stepWaste = await models.FormStepWaste.findAll({
        where: { formId: form.dataValues.id },
      });
      const stepRefrigerants = await models.FormStepRefrigerants.findAll({
        where: { formId: form.dataValues.id },
      });
      const stepTransportation = await models.FormStepTransportation.findAll({
        where: { formId: form.dataValues.id },
      });
      const emissions = await calculateEmissions(
        {
          stepYear,
          stepCAEN,
          stepElectricity,
          stepHeating,
          stepWaste,
          stepRefrigerants,
          stepTransportation,
        },
        models
      );

      return res.status(200).send({
        formId: form.id,
        year: form.year,
        emissions: emissions,
        companyName: user.companyName,
        emissionBadge: form.emissionBadge,
      });
    }
    return res.status(404).send("Form not found");
  });
};
