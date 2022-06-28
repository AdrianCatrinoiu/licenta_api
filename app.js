const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { start } = require("repl");
const app = express();
const bodyParser = require("body-parser");
const models = require("./models");
const fileUpload = require("express-fileupload");

app.use(express.static("db"));
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

require("./routes/auth")(app, models);
require("./routes/form")(app, models);
require("./routes/seed")(app, models);
require("./routes/statistics")(app, models);

console.log(`Using db: ${process.env.DB_NAME}`);
console.log("👍 API Instance Running. OK");

app.listen(5000, () => {
  console.log("Server runs on port 5000");
});
