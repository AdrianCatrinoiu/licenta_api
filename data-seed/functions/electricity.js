const calculateElectricityGrading = (electricityData) => {
  let numbersList = [];

  // adaugam valorile gCO2 multiplicate intr-o lista
  electricityData.forEach((row) => {
    if (row.gCO2 !== null) {
      const value = row.gCO2;
      numbersList.push(Number(value.toFixed(2)));
    }
  });

  // sortam lista de valori gCO2
  const sortedList = numbersList.sort((a, b) => a - b);
  let totalNrs = sortedList.length;

  const upadatedElectricityData = electricityData.map((row) => {
    const value = row.gCO2;
    const currentValue = Number(value.toFixed(2));
    let nrsBelow = sortedList.findIndex((value) => value === currentValue);
    const percentile = (nrsBelow / totalNrs) * 100; //calculam percentila

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
  await models.ElectricityStatistics.bulkCreate(electricityData);
};

const evalElectricity = (electricityData, models) => {
  const completeElectricityData =
    removeElectricityMissingCodes(electricityData);

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
