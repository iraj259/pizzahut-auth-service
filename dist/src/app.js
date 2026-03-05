"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = __importDefault(require("./config/logger"));
const auth_1 = __importDefault(require("./routes/auth"));
const tenant_1 = __importDefault(require("./routes/tenant"));
const user_1 = __importDefault(require("./routes/user"));
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const rsa_pem_to_jwk_1 = __importDefault(require("rsa-pem-to-jwk"));
const app = (0, express_1.default)();
app.use(express_1.default.static("public"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// dynamic JWKS route — add this **before** `app.use('/auth', authRouter)`
app.get('/.well-known/jwks.json', (req, res) => {
    const privateKey = fs_1.default.readFileSync('./certs/private.pem');
    const jwk = (0, rsa_pem_to_jwk_1.default)(privateKey, { use: 'sig' }, 'public');
    res.json({ keys: [jwk] });
});
// if we make the function async the global error handler wont be able to catch it, the sol is to use next middleware but in v5 of express it handles this thing too
app.get('/', (req, res) => {
    res.send('welcome to the auth service');
});
app.use('/auth', auth_1.default);
app.use('/tenant', tenant_1.default);
app.use('/user', user_1.default);
// global error handler and should always be placed at last
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    logger_1.default.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            }
        ]
    });
});
exports.default = app;
