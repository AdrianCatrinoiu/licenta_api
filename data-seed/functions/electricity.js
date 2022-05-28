const calculateElectricityMinMax = (data) => {
  let minValue = 99999;
  let maxValue = -1;

  data.forEach((row) => {
    if (row.gCO2 < minValue && row.gCO2 !== null) {
      minValue = row.gCO2;
    }

    if (row.gCO2 > maxValue && row.gCO2 !== null) {
      maxValue = row.gCO2;
    }
  });
  return { minValue: minValue.toFixed(2), maxValue: maxValue.toFixed(2) };
};

const calculateElectricityGrading = (electricityData, minValue, maxValue) => {
  let numbersList = [];

  // add multiplied gCO2 values to an array
  electricityData.forEach((row) => {
    if (row.gCO2 !== null) {
      const value = row.gCO2;
      numbersList.push(Number(value.toFixed(2)));
    }
  });

  // sort the array of CO2 values
  const sortedList = numbersList.sort((a, b) => a - b);
  let totalNrs = sortedList.length;

  const upadatedElectricityData = electricityData.map((row) => {
    const value = row.gCO2;
    const currentValue = Number(value.toFixed(2));
    let nrsBelow = sortedList.findIndex((value) => value === currentValue);
    const percentile = (nrsBelow / totalNrs) * 100;

    return {
      ...row,
      gCO2percentile: Number(percentile.toFixed(2)),
    };
  });
  return upadatedElectricityData;
};

const removeElectricityMissingCodes = (data) => {
  return data.filter((row) => row.Code !== null);
};

const saveToDatabase = async (electricityData, models) => {
  console.log(electricityData);
  await models.ElectricityStatistics.bulkCreate(electricityData);
};

const evalElectricity = (electricityData, models) => {
  const completeElectricityData =
    removeElectricityMissingCodes(electricityData);

  const { minValue, maxValue } = calculateElectricityMinMax(
    completeElectricityData
  );

  const gradedElectricityData = calculateElectricityGrading(
    completeElectricityData,
    minValue,
    maxValue
  );

  saveToDatabase(gradedElectricityData, models);
};

module.exports = {
  evalElectricity,
};
