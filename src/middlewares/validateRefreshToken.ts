import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],

  getToken: (req: Request) => {
    console.log("getToken called, cookie refreshToken:", req.cookies?.refreshToken);
    return req.cookies?.refreshToken;
  },

  async isRevoked(req: Request, token) {
    if (!token?.payload) {
      return true; // invalid token
    }

    // jti in the JWT is the refresh token ID
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
const refreshTokenId = Number((token.payload as any).id);
    const userId = Number(token.payload.sub);

    console.log("isRevoked called, token payload:", token.payload);

    if (isNaN(refreshTokenId) || isNaN(userId)) {
      console.error("Invalid token payload, jti or sub is not a number");
      return true;
    }

    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

      const refreshToken = await refreshTokenRepo.findOne({
        where: {
          id: refreshTokenId,
          user: { id: userId },
        },
      });

      if (!refreshToken) {
        console.error("Refresh token not found or revoked");
      }

      return refreshToken === null;
    } catch (error) {
      logger.error("Error while getting the refresh token", {
        jti: refreshTokenId,
        userId,
        error,
      });
      return true;
    }
  },
});