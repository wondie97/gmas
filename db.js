// db.js - Render PostgreSQL 연결

const { Pool } = require("pg");
require("dotenv").config(); // 로컬에서 .env 쓸 때용

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = pool;
