const { readFileAndIngest } = require("../data-seed/read-file.js");

const STATISTIC_TYPES = [
  "burning",
  "electricity",
  "waste",
  "refrigerants",
  "transportation",
];
module.exports = (app, models) => {
  app.get("/data-seed", async function (req, res) {
    const adminKey = req.query.adminKey;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).send("Unauthorized");
    }
    STATISTIC_TYPES.forEach(async (statisticType) => {
      readFileAndIngest(statisticType, models);
    });
    return res.status(200).send("OK");
  });
};
