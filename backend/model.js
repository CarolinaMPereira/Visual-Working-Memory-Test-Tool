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
      `CREATE TABLE IF NOT EXISTS vwm (
        "user_id" VARCHAR(40),
        "vwm_score" NUMERIC,
        "duration" NUMERIC,
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
    pool.query("SELECT * FROM vwm ORDER BY user_id ASC", (error, results) => {
      if (error) {
        reject(error);
        console.log(error);
      }
      resolve(results.rows);
    });
  });
};

const createParticipant = (body) => {
  return new Promise(function (resolve, reject) {
    const { user_id } = body;
    pool.query(
      "INSERT INTO vwm (user_id) VALUES ($1) RETURNING *",
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
    const { vwm_score, duration, user_id } = body;
    pool.query(
      "UPDATE vwm SET vwm_score = ($1), duration = ($2) WHERE user_id = $3",
      [vwm_score, duration, user_id],
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
