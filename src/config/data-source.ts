import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User.ts";  // keep .ts
import { Config } from "./index.ts";       // keep .ts

// compute booleans outside object
const NODE_ENV = Config.NODE_ENV ?? "dev";
const isDevOrTest = NODE_ENV === "dev" || NODE_ENV === "test";

// convert port to number beforehand
const DB_PORT = Number(Config.DB_PORT);

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: DB_PORT,
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: isDevOrTest,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});
