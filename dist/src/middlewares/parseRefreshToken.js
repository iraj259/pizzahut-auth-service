"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const config_1 = require("../config");
exports.default = (0, express_jwt_1.expressjwt)({
    secret: config_1.Config.REFRESH_TOKEN_SECRET,
    algorithms: ["HS256"],
    getToken: (req) => {
        var _a;
        return (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    },
});
