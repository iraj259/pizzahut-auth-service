import fs from "fs";
import path from "path";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";

export class TokenService {
    private privateKey: Buffer;

    constructor() {
        this.privateKey = fs.readFileSync(
            path.join(__dirname, "../../certs/private.pem")
        );
    }

    generateAccessToken(payload: JwtPayload) {
        return sign(payload, this.privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
    }

    generateRefreshToken(payload: JwtPayload, tokenId: string) {
        return sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: tokenId,
        });
    }
}