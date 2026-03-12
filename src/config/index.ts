import { config } from "dotenv";
import path from "path";
import fs from "fs";

// MUST run immediately
const env = process.env.NODE_ENV || "dev";

config({
  path: path.join(__dirname, `../../.env.${env}`),
});

// pull variables after dotenv has run
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
  PRIVATE_KEY: ENV_PRIVATE_KEY,
  PRIVATE_KEY_PATH,
} = process.env;

let PRIVATE_KEY = ENV_PRIVATE_KEY;

if (PRIVATE_KEY_PATH) {
  try {
    const fullPath = path.isAbsolute(PRIVATE_KEY_PATH)
      ? PRIVATE_KEY_PATH
      : path.join(process.cwd(), PRIVATE_KEY_PATH);
    if (fs.existsSync(fullPath)) {
      PRIVATE_KEY = fs.readFileSync(fullPath, "utf8");
    }
  } catch (err) {
    // fallback to ENV_PRIVATE_KEY if file read fails
  }
}

// Export as a single object
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
  PRIVATE_KEY
};

// fail fast if secret is missing
if (!Config.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "REFRESH_TOKEN_SECRET is missing from environment variables! Check your .env file."
  );
}