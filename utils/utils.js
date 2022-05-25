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

  calculateEmissions: (formData) => {
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
    let electricityEmission = {};
    // cautam dupa an in tabel
    if (formData.stepElectricity.country) {
      if (formData.stepElectricity.year) {
        electricityEmission = electricityEmissions.find(
          (electricityEmission) =>
            electricityEmission.Country === formData.stepElectricity.country &&
            electricityEmission.Year === formData.stepElectricity.year &&
            formData.stepElectricity.year <= 2020
        );
      } else {
        //daca anul selectat este peste anii din tabel punem ultimul an din tabel
        electricityEmission = electricityEmissions.find(
          (electricityEmission) =>
            electricityEmission.Country === formData.stepElectricity.country &&
            electricityEmission.Year === 2020
        );
      }
      emissions.electricity.CO2 =
        (formData.stepElectricity.nonRenewableAmount *
          electricityEmission.gCO2) /
        1000;
    }

    formData.stepHeating.forEach((heating) => {
      if (heating.label) {
        const heatingEmission = GHGEmissions.find(
          (GHGEmission) => GHGEmission.type === "Burning"
        );
        const heatingEmissionValue = heatingEmission.typeList.find(
          (type) => type.label === heating.label
        );

        emissions.heating.CO2 += heating.value * heatingEmissionValue.CO2value;
        emissions.heating.CH4 += heating.value * heatingEmissionValue.CH4value;
        emissions.heating.N2O += heating.value * heatingEmissionValue.N2Ovalue;
      }
    });

    formData.stepWaste.forEach((waste) => {
      if (waste.label) {
        const wasteEmissionValue = wasteEmissions.find(
          (type) => type.label === waste.label
        );
        emissions.waste.CO2 +=
          parseFloat(waste.value) *
          (wasteEmissionValue[waste.type] * 0.907) *
          1000;
      }
    });

    formData.stepRefrigerants.forEach((refrigerant) => {
      if (refrigerant.label) {
        const refrigerantEmission = GHGEmissions.find(
          (GHGEmission) => GHGEmission.type === "Refrigerants"
        );
        const refrigerantEmissionValue = refrigerantEmission.typeList.find(
          (type) => type.label === refrigerant.label
        );
        emissions.refrigerants.CO2 +=
          (parseFloat(refrigerant.kgBegin) - parseFloat(refrigerant.kgEnd)) *
          refrigerantEmissionValue.GWP;
      }
    });

    formData.stepTransportation.forEach((transportation) => {
      if (transportation.label) {
        const transportEmission = GHGEmissions.find(
          (GHGEmission) => GHGEmission.type === "Transportation"
        );
        const transportEmissionValue = transportEmission.typeList.find(
          (type) => type.label === transportation.label
        );
        if (transportation.fuelUnit === "litres") {
          emissions.transportation.CO2 +=
            transportation.fuelUsed *
            0.2641722 *
            transportEmissionValue.CO2value;
          emissions.transportation.CH4 +=
            transportation.fuelUsed *
            0.2641722 *
            transportEmissionValue.CH4value;
          emissions.transportation.N2O +=
            transportation.fuelUsed *
            0.2641722 *
            transportEmissionValue.N2Ovalue;
        }
        if (transportation.fuelUnit === "m³") {
          emissions.transportation.CO2 +=
            transportation.fuelUsed *
            0.0283168 *
            transportEmissionValue.CO2value;
          emissions.transportation.CH4 +=
            transportation.fuelUsed *
            0.0283168 *
            transportEmissionValue.CH4value;
          emissions.transportation.N2O +=
            transportation.fuelUsed *
            0.0283168 *
            transportEmissionValue.N2Ovalue;
        }
      }
    });

    return emissions;
  },
};
