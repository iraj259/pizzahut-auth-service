import {config} from 'dotenv'
import path from 'path'

const env = process.env.NODE_ENV || "dev";

config({
  path: path.join(__dirname, `../../.env.${env}`)
});

const {PORT,NODE_ENV, DB_HOST, DB_USERNAME,DB_PORT, DB_NAME, DB_PASSWORD, JWKS_URI ,REFRESH_TOKEN_SECRET} = process.env

export const Config={
    PORT,
    NODE_ENV,
    DB_HOST, 
    DB_USERNAME,
    DB_PORT, 
    DB_NAME, 
    DB_PASSWORD,
    REFRESH_TOKEN_SECRET,
    JWKS_URI
}