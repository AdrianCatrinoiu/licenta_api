const calculateWasteGrading = (wasteData) => {
  let numbersListRecycled = [];
  let numbersListLandfilled = [];
  let numbersListCombusted = [];
  let numbersListComposted = [];

  // add multiplied values to an array
  wasteData.forEach((row) => {
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
  await models.WasteStatistics.bulkCreate(wasteData);
};

const evalWaste = (wasteData, models) => {
  const convertedData = convertToMetricUnit(wasteData);
  const gradedWasteData = calculateWasteGrading(convertedData);
  saveToDatabase(gradedWasteData, models);
};

module.exports = {
  evalWaste,
};
