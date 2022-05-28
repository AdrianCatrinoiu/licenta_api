const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const { evalBurning } = require("./functions/burning.js");
const { evalElectricity } = require("./functions/electricity.js");
const { evalRefrigerants } = require("./functions/refrigerants.js");
const { evalTransportation } = require("./functions/transportation.js");
const { evalWaste } = require("./functions/waste.js");

const NULLISH_FIELD_VALUES = ["", "-", "NA", "N/A"];

const sanitizeFloatField = (field) => {
  // replace extra commas from float fields and cast them to Float type from String
  if (field.includes(".")) {
    field = field.replace(".", "");
  }
  if (field.includes(",")) {
    field = field.replace(",", ".");
  }
  if (!isNaN(parseFloat(field))) {
    return parseFloat(field);
  }
  return field;
};

const formatCsvRowValues = (row) => {
  const formattedRow = row;
  // for each table row in the .csv file, we need to format the values
  Object.keys(row).forEach((key) => {
    const objectRowTrimmed = sanitizeFloatField(row[key].trim());
    if (NULLISH_FIELD_VALUES.includes(objectRowTrimmed)) {
      formattedRow[key] = null;
    } else {
      formattedRow[key] = objectRowTrimmed;
    }
  });
  return formattedRow;
};

const readFileAndIngest = async (fileName, models) => {
  const csvData = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.resolve(__dirname + `/statistics/indices_${fileName}.csv`)
    )
      .pipe(csv.parse({ headers: true, delimiter: ";" }))
      .on("error", (error) => console.error(error))
      .on("data", (row) => {
        const formattedRow = formatCsvRowValues(row);
        csvData.push(formattedRow);
      })
      .on("end", () => {
        switch (fileName) {
          case "burning":
            evalBurning(csvData, models);
            break;
          case "electricity":
            evalElectricity(csvData, models);
            break;
          case "refrigerants":
            evalRefrigerants(csvData, models);
            break;
          case "transportation":
            evalTransportation(csvData, models);
            break;
          case "waste":
            evalWaste(csvData, models);
            break;
          default:
            console.log("No matching file found");
        }
      });
  });
};

module.exports = {
  readFileAndIngest,
};
