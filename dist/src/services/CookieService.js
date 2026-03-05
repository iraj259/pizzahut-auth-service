"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieService = void 0;
class CookieService {
    constructor(logger) {
        this.logger = logger;
    }
    setTokens(res, accessToken, refreshToken, userId) {
        res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
        });
        res.cookie("refreshToken", refreshToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
        });
        this.logger.info("Access and refresh tokens set in cookies", { id: userId });
    }
}
exports.CookieService = CookieService;
