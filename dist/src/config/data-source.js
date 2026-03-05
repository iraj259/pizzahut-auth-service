"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const index_1 = require("./index"); // keep .ts
// convert port to number beforehand
const DB_PORT = Number(index_1.Config.DB_PORT);
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: index_1.Config.DB_HOST,
    port: DB_PORT,
    username: index_1.Config.DB_USERNAME,
    password: index_1.Config.DB_PASSWORD,
    database: index_1.Config.DB_NAME,
    // don't use in prod alway keep false
    synchronize: false,
    logging: false,
    entities: ["src/entity/*.{ts,js}"],
    migrations: ["src/migration/*.{ts,js}"],
    subscribers: [],
});
