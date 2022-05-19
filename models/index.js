"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
// const dotenv = require("dotenv");
// dotenv.config({ path: "../.env" });
let models = {};

// console.log("-> process.env.DB_NAME: " + process.env.DB_NAME);
// console.log("-> process.env.DB_USERNAME: " + process.env.DB_USERNAME);
// console.log("-> process.env.DB_PASSWORD: " + process.env.DB_PASSWORD);
// console.log("=> process.env.DB_HOST: " + process.env.DB_HOST);
// console.log("-> process.env.DB_PORT" + process.env.DB_PORT);

var pg = require("pg");
pg.defaults.ssl = true;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    ssl: true,
    /* disable logging to console */
    logging: function (str) {
      console.log("\x1b[36m%s\x1b[0m", "[~~] SQL: " + str + "\n\n");
    },
    dialectOptions: {
      useUTC: false, //for reading from database
      dateStrings: true,
      typeCast: true,
      // ssl: true,
      ssl: { ssl: true },
      // rejectUnauthorized: false,
    },
    // dialectOptions: {
    //   useUTC: false, // for reading from database
    // },
    // timezone: "-4:00", // for writing to database
    // dialectOptions: {
    //   dateStrings: true,
    //   typeCast: true,
    // },
    // timezone: "America/New_York",

    // dialectOptions: {
    //   useUTC: false, //for reading from database
    //   dateStrings: true,
    //   typeCast: true,
    //   timezone: "+05:30",
    // },
    // timezone: "+05:30", //for writing to database

    // timezone: '+05:30'
  }
);

// sequelize.sync();

// const sequelize = new Sequelize(
//   process.env.DATABASE_NAME_DB_CONFIG,
//   process.env.USER_NAME_DB_CONFIG,
//   process.env.USER_PASSWORD_DB_CONFIG,
//   {
//       host: process.env.HOST_DB_CONFIG,
//       dialect: process.env.DIALECT_DB_CONFIG,
//       protocol: process.env.PROTOCOL_DB_CONFIG,
//       logging:  true,
//       dialectOptions: {
//           ssl: true
//       },
//       pool: {
//           max: 5,
//           min: 0,
//           idle: 10000
//       }
//   }
// );

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    models[model.name] = model;
  });

/**
 * loop through & associate all Sequelize models if needed
 */
Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.op = sequelize.Op;

module.exports = models;
