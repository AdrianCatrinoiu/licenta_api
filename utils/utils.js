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
        (formData.stepElectricity.nonRenewableAmount *
          electricityEmissionValue.dataValues.gCO2) /
        1000000;
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
  calculateEmissionBadge: async (formData, emissions, models) => {
    let emissionBadgeValues = {
      electricity: 0,
      heating: 0,
      waste: 0,
      refrigerants: 0,
      transportation: 0,
    };
    let emissionTotal = 0;
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
      emissionTotal =
        formData.stepElectricity.nonRenewableAmount +
        formData.stepElectricity.renewableAmount;

      emissionBadgeValues.electricity =
        (formData.stepElectricity.nonRenewableAmount / emissionTotal) * 100;
    }
    for (const heating of formData.stepHeating) {
      if (heating.label) {
        const heatingEmissionValue = await models.BurningStatistics.findOne({
          where: {
            label: heating.label,
          },
        });
        if (heatingEmissionValue) {
          const heatEmission =
            heating.value * heatingEmissionValue.dataValues.CO2value;

          emissionBadgeValues.heating +=
            (heatEmission / emissions.heating.CO2) *
            100 *
            (heatingEmissionValue.dataValues.CO2percentile / 100);
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
          const wasteEmission =
            parseFloat(waste.value) * wasteEmissionValue[waste.type] * 1000;
          if (wasteEmissionValue[waste.type] > 0) {
            if (waste.type === "Recycled") {
              emissionBadgeValues.waste +=
                (wasteEmission / emissions.waste.CO2) *
                100 *
                (wasteEmissionValue.dataValues.percentileRecycled / 100);
            }
            if (waste.type === "Landfilled") {
              emissionBadgeValues.waste +=
                (wasteEmission / emissions.waste.CO2) *
                100 *
                (wasteEmissionValue.dataValues.percentileLandfilled / 100);
            }
            if (waste.type === "Combusted") {
              emissionBadgeValues.waste +=
                (wasteEmission / emissions.waste.CO2) *
                100 *
                (wasteEmissionValue.dataValues.percentileCombusted / 100);
            }
            if (waste.type === "Composted") {
              emissionBadgeValues.waste +=
                (wasteEmission / emissions.waste.CO2) *
                100 *
                (wasteEmissionValue.dataValues.percentileComposted / 100);
            }
          }
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
          const refrigerantsEmission =
            (parseFloat(refrigerant.kgBegin) - parseFloat(refrigerant.kgEnd)) *
            refrigerantEmissionValue.dataValues.GWP;

          emissionBadgeValues.refrigerants +=
            (refrigerantsEmission / emissions.refrigerants.CO2) *
            100 *
            (refrigerantEmissionValue.dataValues.GWPpercentile / 100);
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

        const transportationEmission =
          transportation.fuelUsed * transportEmissionValue.dataValues.CO2value;

        emissionBadgeValues.transportation +=
          (transportationEmission / emissions.transportation.CO2) *
          100 *
          (transportEmissionValue.dataValues.CO2percentile / 100);
      }
    }
    const badgeValue =
      (emissionBadgeValues.electricity +
        emissionBadgeValues.heating +
        emissionBadgeValues.waste +
        emissionBadgeValues.refrigerants +
        emissionBadgeValues.transportation) /
      5;

    switch (true) {
      case badgeValue < 5:
        return "A+++";
      case badgeValue < 10:
        return "A++";
      case badgeValue < 15:
        return "A+";
      case badgeValue < 25:
        return "A";
      case badgeValue < 40:
        return "B";
      case badgeValue < 60:
        return "C";
      case badgeValue < 80:
        return "D";
      case badgeValue < 100:
        return "E";
    }
    return;
  },
};
