"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const config_1 = require("../config");
const data_source_1 = require("../config/data-source");
const RefreshToken_1 = require("../entity/RefreshToken");
const logger_1 = __importDefault(require("../config/logger"));
exports.default = (0, express_jwt_1.expressjwt)({
    secret: config_1.Config.REFRESH_TOKEN_SECRET,
    algorithms: ["HS256"],
    getToken: (req) => {
        var _a, _b;
        console.log("getToken called, cookie refreshToken:", (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken);
        return (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refreshToken;
    },
    isRevoked(req, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(token === null || token === void 0 ? void 0 : token.payload)) {
                return true; // invalid token
            }
            // jti in the JWT is the refresh token ID
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const refreshTokenId = Number(token.payload.id);
            const userId = Number(token.payload.sub);
            console.log("isRevoked called, token payload:", token.payload);
            if (isNaN(refreshTokenId) || isNaN(userId)) {
                console.error("Invalid token payload, jti or sub is not a number");
                return true;
            }
            try {
                const refreshTokenRepo = data_source_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
                const refreshToken = yield refreshTokenRepo.findOne({
                    where: {
                        id: refreshTokenId,
                        user: { id: userId },
                    },
                });
                if (!refreshToken) {
                    console.error("Refresh token not found or revoked");
                }
                return refreshToken === null;
            }
            catch (error) {
                logger_1.default.error("Error while getting the refresh token", {
                    jti: refreshTokenId,
                    userId,
                    error,
                });
                return true;
            }
        });
    },
});
