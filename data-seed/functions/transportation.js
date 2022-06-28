const calculateTransportationGrading = (transportationData) => {
  let numbersList = [];

  // add multiplied CO2value values to an array
  transportationData.forEach((row) => {
    if (row.CO2value !== null) {
      const value = row.CO2value;
      numbersList.push(Number(value.toFixed(2)));
    }
  });

  // sort the array of CO2value values
  const sortedList = numbersList.sort((a, b) => a - b);
  let totalNrs = sortedList.length;

  const upadatedTransportationData = transportationData.map((row) => {
    const value = row.CO2value;
    const currentValue = Number(value.toFixed(2));
    let nrsBelow = sortedList.findIndex((value) => value === currentValue);
    const percentile = (nrsBelow / totalNrs) * 100;

    return {
      ...row,
      CO2percentile: Number(percentile.toFixed(2)),
    };
  });
  return upadatedTransportationData;
};

const fillTransportationMissingData = (data) => {
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

const convertToMetricUnit = (data) => {
  const newData = data;
  newData.map((row) => {
    if (row.unit === "gal (US)") {
      row.CO2value = row.CO2value * 0.264;
      row.CH4value = row.CH4value * 0.264;
      row.N2Ovalue = row.N2Ovalue * 0.264;
      row.CO2BiogenicValue = row.CO2BiogenicValue * 0.264;
      row.unit = "litres";
    }
    if (row.unit === "scf") {
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

const saveToDatabase = async (transportationData, models) => {
  await models.TransportationStatistics.bulkCreate(transportationData);
};

const evalTransportation = (transportationData, models) => {
  const convertedData = convertToMetricUnit(transportationData);
  const completeTransportationData =
    fillTransportationMissingData(convertedData);

  const gradedTransportationData = calculateTransportationGrading(
    completeTransportationData
  );

  saveToDatabase(gradedTransportationData, models);
};

module.exports = {
  evalTransportation,
};
