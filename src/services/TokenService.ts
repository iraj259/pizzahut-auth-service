import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { sign, JwtPayload } from "jsonwebtoken"; // Fixed import for sign
import { Config } from "../config";
import createHttpError from "http-errors";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(path.join(__dirname, "../../certs/private.pem"));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            throw createHttpError(500, "Error while reading private key");
        }

        return sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
    }

   generateRefreshToken(payload: JwtPayload, tokenId: string) {
    return sign(
        {
            ...payload,
            id: tokenId, // this is the refresh token id
        },
        Config.REFRESH_TOKEN_SECRET!,
        {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
        }
    );
}

    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

        const newToken = this.refreshTokenRepository.create({
            user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        return await this.refreshTokenRepository.save(newToken);
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({id:tokenId});
    }
}