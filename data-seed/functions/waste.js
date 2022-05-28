const calculateWasteMinMax = (data) => {
  let minValueRecycled = 99999;
  let maxValueRecycled = -1;

  let minValueLandfilled = 99999;
  let maxValueLandfilled = -1;

  let minValueCombusted = 99999;
  let maxValueCombusted = -1;

  let minValueComposted = 99999;
  let maxValueComposted = -1;

  data.forEach((row) => {
    console.log(row);
    // calculate min value
    if (row.Recycled !== null && row.Recycled < minValueRecycled) {
      minValueRecycled = row.Recycled;
    }
    if (row.Landfilled !== null && row.Landfilled < minValueLandfilled) {
      minValueLandfilled = row.Landfilled;
    }
    if (row.Combusted !== null && row.Combusted < minValueCombusted) {
      minValueCombusted = row.Combusted;
    }
    if (row.Composted !== null && row.Composted < minValueComposted) {
      minValueComposted = row.Composted;
    }

    //calculate max value
    if (row.Recycled !== null && row.Recycled > maxValueRecycled) {
      maxValueRecycled = row.Recycled;
    }

    if (row.Landfilled !== null && row.Landfilled > maxValueLandfilled) {
      maxValueLandfilled = row.Landfilled;
    }

    if (row.Combusted !== null && row.Combusted > maxValueCombusted) {
      maxValueCombusted = row.Combusted;
    }

    if (row.Composted !== null && row.Composted > maxValueComposted) {
      maxValueComposted = row.Composted;
    }
  });

  return {
    minValueRecycled: minValueRecycled.toFixed(2),
    maxValueRecycled: maxValueRecycled.toFixed(2),
    minValueLandfilled: minValueLandfilled.toFixed(2),
    maxValueLandfilled: maxValueLandfilled.toFixed(2),
    minValueCombusted: minValueCombusted.toFixed(2),
    maxValueCombusted: maxValueCombusted.toFixed(2),
    minValueComposted: minValueComposted.toFixed(2),
    maxValueComposted: maxValueComposted.toFixed(2),
  };
};

const calculateWasteGrading = (wasteData, minValue, maxValue) => {
  let numbersListRecycled = [];
  let numbersListLandfilled = [];
  let numbersListCombusted = [];
  let numbersListComposted = [];

  // add multiplied values to an array
  wasteData.forEach((row) => {
    console.log(row);
    if (row.Recycled !== null) {
      const valueRecycled = row.Recycled;
      numbersListRecycled.push(Number(valueRecycled.toFixed(2)));
    }
    if (row.Landfilled !== null) {
      const valueLandfilled = row.Landfilled;
      numbersListLandfilled.push(Number(valueLandfilled.toFixed(2)));
    }
    if (row.Combusted !== null) {
      const valueCombusted = row.Combusted;
      numbersListCombusted.push(Number(valueCombusted.toFixed(2)));
    }
    if (row.Composted !== null) {
      const valueComposted = row.Composted;
      numbersListComposted.push(Number(valueComposted.toFixed(2)));
    }
  });

  // sort the array of values
  const sortedListRecycled = numbersListRecycled.sort((a, b) => a - b);
  const sortedListLandfilled = numbersListLandfilled.sort((a, b) => a - b);
  const sortedListCombusted = numbersListCombusted.sort((a, b) => a - b);
  const sortedListComposted = numbersListComposted.sort((a, b) => a - b);

  let totalNrsRecycled = sortedListRecycled.length;
  let totalNrsLandfilled = sortedListLandfilled.length;
  let totalNrsCombusted = sortedListCombusted.length;
  let totalNrsComposted = sortedListComposted.length;

  const upadatedWasteData = wasteData.map((row) => {
    let percentileRecycled = 0;
    let percentileLandfilled = 0;
    let percentileCombusted = 0;
    let percentileComposted = 0;

    if (row.Recycled !== null) {
      const currentValueRecycled = Number(row.Recycled.toFixed(2));
      let nrsBelowRecycled = sortedListRecycled.findIndex(
        (val) => val === currentValueRecycled
      );
      percentileRecycled = (nrsBelowRecycled / totalNrsRecycled) * 100;
    }

    if (row.Landfilled !== null) {
      const currentValueLandfilled = Number(row.Landfilled.toFixed(2));
      let nrsBelowLandfilled = sortedListLandfilled.findIndex(
        (val) => val === currentValueLandfilled
      );
      percentileLandfilled = (nrsBelowLandfilled / totalNrsLandfilled) * 100;
    }

    if (row.Combusted !== null) {
      const currentValueCombusted = Number(row.Combusted.toFixed(2));
      let nrsBelowCombusted = sortedListCombusted.findIndex(
        (val) => val === currentValueCombusted
      );
      percentileCombusted = (nrsBelowCombusted / totalNrsCombusted) * 100;
    }

    if (row.Composted !== null) {
      const currentValueComposted = Number(row.Composted.toFixed(2));
      let nrsBelowComposted = sortedListComposted.findIndex(
        (val) => val === currentValueComposted
      );
      percentileComposted = (nrsBelowComposted / totalNrsComposted) * 100;
    }
    return {
      ...row,
      percentileRecycled:
        row.Recycled !== null ? Number(percentileRecycled.toFixed(2)) : null,
      percentileLandfilled:
        row.Landfilled !== null
          ? Number(percentileLandfilled.toFixed(2))
          : null,
      percentileCombusted:
        row.Combusted !== null ? Number(percentileCombusted.toFixed(2)) : null,
      percentileComposted:
        row.Composted !== null ? Number(percentileComposted.toFixed(2)) : null,
    };
  });
  return upadatedWasteData;
};

const convertToMetricUnit = (data) => {
  const newData = data;
  newData.map((row) => {
    row.Recycled = row.Recycled * 1.102;
    row.Landfilled = row.Landfilled * 1.102;
    row.Combusted = row.Combusted * 1.102;
    row.Composted = row.Composted * 1.102;

    return row;
  });
  return newData;
};

const saveToDatabase = async (wasteData, models) => {
  console.log(wasteData);
  await models.WasteStatistics.bulkCreate(wasteData);
};

const evalWaste = (wasteData, models) => {
  const convertedData = convertToMetricUnit(wasteData);
  const minMaxData = calculateWasteMinMax(convertedData);
  const gradedWasteData = calculateWasteGrading(wasteData, minMaxData);
  saveToDatabase(gradedWasteData, models);
};

module.exports = {
  evalWaste,
};
