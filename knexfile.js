import "dotenv/config";

const connectionSettings = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: "utf8",
};
if (process.env.DB_PORT) connectionSettings.port = process.env.DB_PORT;

export default {
  client: "mysql2",
  connection: connectionSettings,
  seeds: {
    directory: "./seeds",
  },
  migrations: {
    directory: "./migrations",
  },
};
