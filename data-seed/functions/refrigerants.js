const calculateRefrigerantsMinMax = (data) => {
  let minValue = 99999;
  let maxValue = -1;

  data.forEach((row) => {
    if (row.GWP < minValue && row.GWP !== null) {
      minValue = row.GWP;
    }

    if (row.GWP > maxValue && row.GWP !== null) {
      maxValue = row.GWP;
    }
  });
  return { minValue: minValue.toFixed(2), maxValue: maxValue.toFixed(2) };
};

const calculateRefrigerantsGrading = (refrigerantsData, minValue, maxValue) => {
  let numbersList = [];

  // add multiplied GWP values to an array
  refrigerantsData.forEach((row) => {
    if (row.GWP !== null) {
      const value = row.GWP;
      numbersList.push(Number(value.toFixed(2)));
    }
  });

  // sort the array of GWP values
  const sortedList = numbersList.sort((a, b) => a - b);
  let totalNrs = sortedList.length;

  const upadatedRefrigerantsData = refrigerantsData.map((row) => {
    const value = row.GWP;
    const currentValue = Number(value.toFixed(2));
    let nrsBelow = sortedList.findIndex((value) => value === currentValue);
    const percentile = (nrsBelow / totalNrs) * 100;

    return {
      ...row,
      GWPpercentile: Number(percentile.toFixed(2)),
    };
  });
  return upadatedRefrigerantsData;
};

const saveToDatabase = async (refrigerantsData, models) => {
  await models.RefrigerantsStatistics.bulkCreate(refrigerantsData);
};

const evalRefrigerants = (refrigerantsData, models) => {
  const { minValue, maxValue } = calculateRefrigerantsMinMax(refrigerantsData);

  const gradedRefrigerantsData = calculateRefrigerantsGrading(
    refrigerantsData,
    minValue,
    maxValue
  );

  saveToDatabase(gradedRefrigerantsData, models);
};

module.exports = {
  evalRefrigerants,
};
