const calculateBurningGrading = (burningData) => {
  let numbersList = [];

  // adaugam valorile gCO2 multiplicate intr-o lista
  burningData.forEach((row) => {
    if (row.CO2value !== null) {
      const value = row.CO2value * row.mmBtu;
      numbersList.push(Number(value.toFixed(2)));
    }
  });

  // sortam lista de valori gCO2
  const sortedList = numbersList.sort((a, b) => a - b);
  let totalNrs = sortedList.length;

  const upadatedBurningData = burningData.map((row) => {
    const value = row.CO2value * row.mmBtu;
    const currentValue = Number(value.toFixed(2));
    let nrsBelow = sortedList.findIndex((value) => value === currentValue);
    const percentile = (nrsBelow / totalNrs) * 100;

    return {
      ...row,
      CO2value: currentValue,
      CO2percentile: Number(percentile.toFixed(2)),
    };
  });
  return upadatedBurningData;
};

const fillBurningMissingData = (data) => {
  return data.map((row) => {
    if (row.CO2value === null && row.CO2BiogenicValue !== null) {
      return {
        ...row,
        CO2value: row.CO2BiogenicValue,
      };
    }
    return row;
  });
};

const saveToDatabase = async (burningData, models) => {
  await models.BurningStatistics.bulkCreate(burningData);
};

const convertToMetricUnit = (data) => {
  const newData = data;
  newData.map((row) => {
    if (row.unit === "mmBtu/short-ton") {
      row.CO2value = row.CO2value * 1.102;
      row.CH4value = row.CH4value * 1.102;
      row.N2Ovalue = row.N2Ovalue * 1.102;
      row.CO2BiogenicValue = row.CO2BiogenicValue * 1.102;
      row.unit = "tonnes";
    }
    if (row.unit === "mmBtu/gallon") {
      row.CO2value = row.CO2value * 0.264;
      row.CH4value = row.CH4value * 0.264;
      row.N2Ovalue = row.N2Ovalue * 0.264;
      row.CO2BiogenicValue = row.CO2BiogenicValue * 0.264;
      row.unit = "litres";
    }
    if (row.unit === "mmBtu/scf") {
      row.CO2value = row.CO2value * 35.3;
      row.CH4value = row.CH4value * 35.3;
      row.N2Ovalue = row.N2Ovalue * 35.3;
      row.CO2BiogenicValue = row.CO2BiogenicValue * 35.3;
      row.unit = "m³";
    }

    return row;
  });
  return newData;
};

const evalBurning = (burningData, models) => {
  const convertedData = convertToMetricUnit(burningData);
  const completeBurningData = fillBurningMissingData(convertedData);
  const { minValue, maxValue } = calculateBurningMinMax(completeBurningData);

  const gradedBurningData = calculateBurningGrading(
    completeBurningData,
    minValue,
    maxValue
  );

  saveToDatabase(gradedBurningData, models);
};

module.exports = {
  evalBurning,
};
