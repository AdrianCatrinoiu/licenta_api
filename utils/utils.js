const jwt = require("jsonwebtoken");
const fs = require("fs");
module.exports = {
  generateToken: (data) => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: "18000s" });
  },

  authenticateJWT: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  },

  saveData: (data, json) => {
    const stringifyData = JSON.stringify(data);
    fs.writeFileSync(json, stringifyData);
  },

  getData: (json) => {
    const jsonData = fs.readFileSync(json);
    return JSON.parse(jsonData);
  },

  calculateEmissions: async (formData, models) => {
    const GHGEmissions = require("../db/GHGEmissions.json");
    const electricityEmissions = require("../db/electricityEmissions.json");
    const wasteEmissions = require("../db/wasteEmissions.json");

    let emissions = {
      electricity: { CO2: 0 },
      heating: { CO2: 0, CH4: 0, N2O: 0 },
      waste: { CO2: 0, CH4: 0, N2O: 0 },
      refrigerants: { CO2: 0 },
      transportation: { CO2: 0, CH4: 0, N2O: 0 },
    };
    let electricityEmissionValue = {};
    // cautam dupa an in tabel
    if (formData.stepElectricity && formData.stepElectricity.country) {
      if (formData.stepElectricity.year) {
        electricityEmissionValue = await models.ElectricityStatistics.findOne({
          where: {
            country: formData.stepElectricity.country,
            year: formData.stepElectricity.year,
          },
        });
      } else {
        //daca anul selectat este peste anii din tabel punem ultimul an din tabel
        electricityEmissionValue = await models.ElectricityStatistics.findOne({
          where: {
            country: formData.stepElectricity.country,
            year: "2020",
          },
        });
      }
      emissions.electricity.CO2 =
        formData.stepElectricity.nonRenewableAmount *
        electricityEmissionValue.dataValues.gCO2;
    }

    for (const heating of formData.stepHeating) {
      if (heating.label) {
        const heatingEmissionValue = await models.BurningStatistics.findOne({
          where: {
            label: heating.label,
          },
        });
        if (heatingEmissionValue) {
          emissions.heating.CO2 +=
            heating.value * heatingEmissionValue.dataValues.CO2value;
          emissions.heating.CH4 +=
            heating.value * heatingEmissionValue.dataValues.CH4value;
          emissions.heating.N2O +=
            heating.value * heatingEmissionValue.dataValues.N2Ovalue;
        }
      }
    }

    for (const waste of formData.stepWaste) {
      if (waste.label) {
        const wasteEmissionValue = await models.WasteStatistics.findOne({
          where: {
            material: waste.label,
          },
        });
        if (wasteEmissionValue) {
          emissions.waste.CO2 +=
            parseFloat(waste.value) * wasteEmissionValue[waste.type] * 1000;
        }
      }
    }

    for (const refrigerant of formData.stepRefrigerants) {
      if (refrigerant.label) {
        const refrigerantEmissionValue =
          await models.RefrigerantsStatistics.findOne({
            where: {
              label: refrigerant.label,
            },
          });
        if (refrigerantEmissionValue) {
          emissions.refrigerants.CO2 +=
            (parseFloat(refrigerant.kgBegin) - parseFloat(refrigerant.kgEnd)) *
            refrigerantEmissionValue.dataValues.GWP;
        }
      }
    }

    for (const transportation of formData.stepTransportation) {
      if (transportation.label) {
        const transportEmissionValue =
          await models.TransportationStatistics.findOne({
            where: {
              label: transportation.label,
            },
          });

        if (transportation.fuelUnit === "litres") {
          emissions.transportation.CO2 +=
            transportation.fuelUsed *
            transportEmissionValue.dataValues.CO2value;
          emissions.transportation.CH4 +=
            transportation.fuelUsed *
            transportEmissionValue.dataValues.CH4value;
          emissions.transportation.N2O +=
            transportation.fuelUsed *
            transportEmissionValue.dataValues.N2Ovalue;
        }
        if (transportation.fuelUnit === "m³") {
          emissions.transportation.CO2 +=
            transportation.fuelUsed *
            transportEmissionValue.dataValues.CO2value;
          emissions.transportation.CH4 +=
            transportation.fuelUsed *
            transportEmissionValue.dataValues.CH4value;
          emissions.transportation.N2O +=
            transportation.fuelUsed *
            transportEmissionValue.dataValues.N2Ovalue;
        }
      }
    }

    return emissions;
  },
};

const getFormData = async (formData) => {
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
      ...calculateEmissions(
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
      ),
    },
  };
};
