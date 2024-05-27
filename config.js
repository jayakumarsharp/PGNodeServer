"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const ALPHAVANTAGE_KEY = process.env.ALPHAVANTAGE_KEY ||"RWS8W5Z52IH2R05L";

const PORT = +process.env.PORT || 3002;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
    ? "pm_test"
    : process.env.DATABASE_URL || "pm";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Portfolio Manager Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("ALPHAVANTAGE_KEY:".yellow, ALPHAVANTAGE_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  ALPHAVANTAGE_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
