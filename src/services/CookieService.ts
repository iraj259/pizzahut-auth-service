// services/CookieService.ts
import { Response } from "express";
import { Logger } from "winston";

export class CookieService {
    constructor(private logger: Logger) {}

    setTokens(
        res: Response,
        accessToken: string,
        refreshToken: string,
        userId: string
    ) {
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