import { config } from "dotenv";
import fs from "fs";
import path from "path";

const env = process.env.NODE_ENV || "dev";

config({
  path: path.join(__dirname, `../../.env.${env}`),
});

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_USERNAME,
  DB_PORT,
  DB_NAME,
  DB_PASSWORD,
  JWKS_URI,
  REFRESH_TOKEN_SECRET,
  PRIVATE_KEY: PRIVATE_KEY_PATH,
} = process.env;

// Read the private key file content
const PRIVATE_KEY = PRIVATE_KEY_PATH
  ? fs.readFileSync(path.join(process.cwd(), PRIVATE_KEY_PATH), "utf8")
  : undefined;

export const Config = {
  PORT: Number(PORT) || 5555,
  NODE_ENV: NODE_ENV || env,
  DB_HOST: DB_HOST || "localhost",
  DB_USERNAME: DB_USERNAME || "root",
  DB_PORT: Number(DB_PORT) || 5432,
  DB_NAME: DB_NAME || "mernstack_auth_service",
  DB_PASSWORD: DB_PASSWORD || "root",
  REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET || "",
  JWKS_URI: JWKS_URI || "",
  PRIVATE_KEY,
};

// fail fast if secrets are missing
if (!Config.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "REFRESH_TOKEN_SECRET is missing from environment variables! Check your .env file."
  );
}

if (!Config.PRIVATE_KEY) {
  throw new Error(
    "PRIVATE_KEY is missing or could not be read! Check your .env file and file path."
  );
}