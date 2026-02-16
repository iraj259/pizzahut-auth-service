import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";  // keep .ts
import { Config } from "./index";       // keep .ts



// convert port to number beforehand
const DB_PORT = Number(Config.DB_PORT);

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: DB_PORT,
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // don't use in prod alway keep false
    synchronize: false,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
