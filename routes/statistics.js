module.exports = (app, models) => {
  app.get("/formStatistics", async (req, res) => {
    let burningValues = await models.BurningStatistics.findAll();

    burningValues = burningValues.map((burningValue) => {
      return {
        label: burningValue.dataValues.label,
        value: null,
        unit: burningValue.dataValues.unit,
      };
    });
    let wasteValues = await models.WasteStatistics.findAll();

    wasteValues = wasteValues.map((wasteValue) => {
      return {
        label: wasteValue.dataValues.material,
      };
    });

    let refrigerantsValues = await models.RefrigerantsStatistics.findAll();

    refrigerantsValues = refrigerantsValues.map((refrigerantsValue) => {
      return {
        label: refrigerantsValue.dataValues.label,
        formula: refrigerantsValue.dataValues.formula,
      };
    });

    let transportationValues = await models.TransportationStatistics.findAll();

    transportationValues = transportationValues.map((transportationValue) => {
      return {
        label: transportationValue.dataValues.label,
        fuelUnit: transportationValue.dataValues.unit,
      };
    });

    return res.status(200).send({
      burningValues: burningValues,
      wasteValues: wasteValues,
      refrigerantsValues: refrigerantsValues,
      transportationValues: transportationValues,
    });
  });
};
