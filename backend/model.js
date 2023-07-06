require("dotenv").config();
const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const createTable = () => {
  return new Promise(function (resolve, reject) {
    pool.query(
      `CREATE TABLE IF NOT EXISTS "participants" (
        "user_id" VARCHAR(30),
        "vwm_score" NUMERIC,
        PRIMARY KEY ("user_id")
      )`,
      (error, results) => {
        if (error) {
          reject(error);
          console.log(error);
        }
        resolve(results.rows);
      }
    );
  });
};

const getParticipant = () => {
  return new Promise(function (resolve, reject) {
    pool.query(
      "SELECT * FROM participants ORDER BY user_id ASC",
      (error, results) => {
        if (error) {
          reject(error);
          console.log(error);
        }
        resolve(results.rows);
      }
    );
  });
};

const createParticipant = (body) => {
  return new Promise(function (resolve, reject) {
    const { user_id } = body;
    pool.query(
      "INSERT INTO participants (user_id) VALUES ($1) RETURNING *",
      [user_id],
      (error, results) => {
        if (error) {
          reject(error);
          console.log(error);
        }
        resolve(`A new participant has been added added: ${results.rows[0]}`);
      }
    );
  });
};

const updateParticipantVWM = (body) => {
  return new Promise(function (resolve, reject) {
    const { vwm_score, user_id } = body;
    pool.query(
      "UPDATE participants SET vwm_score = ($1) WHERE user_id = $2",
      [vwm_score, user_id],
      (error, results) => {
        if (error) {
          reject(error);
          console.log(error);
        }
        resolve(`Updated participant: ${results.rows[0]}`);
      }
    );
  });
};

module.exports = {
  createTable,
  getParticipant,
  createParticipant,
  updateParticipantVWM,
};
