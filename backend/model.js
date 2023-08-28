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
        "vwm_capacity" NUMERIC,
        "size4_score" NUMERIC,
        "size8_score" NUMERIC,
        "size4_hit_rate" NUMERIC,
        "size4_false_alarm" NUMERIC,
        "size8_hit_rate" NUMERIC,
        "size8_false_alarm" NUMERIC,
        "correct_answers" VARCHAR[],
        "user_answers" VARCHAR[],
        "set_sizes" NUMERIC[],
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
    const {
      vwm_score,
      size4_score,
      size8_score,
      size4_hit_rate,
      size4_false_alarm,
      size8_hit_rate,
      size8_false_alarm,
      correct_answers,
      user_answers,
      set_sizes,
      duration,
      user_id,
    } = body;
    pool.query(
      "UPDATE vwm SET vwm_capacity = ($1), size4_score = ($2), size8_score = ($3), size4_hit_rate = ($4), size4_false_alarm = ($5), size8_hit_rate = ($6), size8_false_alarm = ($7), correct_answers = ($8), user_answers = ($9), set_sizes = ($10), duration = ($11) WHERE user_id = $12",
      [
        vwm_score,
        size4_score,
        size8_score,
        size4_hit_rate,
        size4_false_alarm,
        size8_hit_rate,
        size8_false_alarm,
        correct_answers,
        user_answers,
        set_sizes,
        duration,
        user_id,
      ],
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
