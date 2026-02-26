import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import loginValidator from "../validators/login-validator";
import { CredentialService } from "../services/CredentialService";
import { TokenService } from "../services/TokenService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import { RefreshToken } from "../entity/RefreshToken";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const credentialService = new CredentialService();
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(
    userService,
    logger,
    credentialService,
    tokenService
);

// routes
router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
);

router.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next)
);

router.get(
    "/self",
    authenticate,
    (req: Request, res: Response) =>
        authController.self(req as AuthRequest, res)
);

router.post(
    "/refresh",
    validateRefreshToken,
    (req: Request, res: Response, next:NextFunction) =>  
        authController.refresh(req as AuthRequest, res, next) 
); 

export default router;