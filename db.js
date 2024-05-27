"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let connParams = {
  user: process.env.user||'postgres',
  password: process.env.password ||"123",
  database: getDatabaseUri(),
}

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    // ...connParams,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    // connectionString: getDatabaseUri()
    ...connParams
  });
}

db.connect();

module.exports = db;