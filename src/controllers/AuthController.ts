// src/controllers/AuthController.ts
import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { TokenService } from "../services/TokenService";
import { CookieService } from "../services/CookieService";

export class AuthController {
    private cookieService: CookieService;

    constructor(
        private userService: UserService,
        private logger: Logger,
        private credentialService: CredentialService,
        private tokenService: TokenService,
    ) {
        this.cookieService = new CookieService(logger); // instantiate
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });

            const { firstName, lastName, email, password } = req.body;

            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info("User created in DB", { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id),
            );

            this.cookieService.setTokens(res, accessToken, refreshToken, String(user.id));

            res.status(201).json({ id: user.id });
            this.logger.info("User registered successfully", { id: user.id });
        } catch (err) {
            this.logger.error("Error during user registration", { error: err });
            next(err);
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty())
                return res.status(400).json({ errors: errors.array() });

            const { email, password } = req.body;
            const user = await this.userService.findByEmail(email);
            if (!user)
                return next(createHttpError(400, "Email or password does not match"));

            const match = await this.credentialService.comparePassword(
                password,
                user.password,
            );
            if (!match)
                return next(createHttpError(400, "Email or password does not match"));

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id),
            );

            this.cookieService.setTokens(res, accessToken, refreshToken, String(user.id));

            res.status(200).json({ id: user.id });
            this.logger.info("User logged in successfully", { id: user.id });
        } catch (err) {
            this.logger.error("Error during user login", { error: err });
            next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        try {
            const user = await this.userService.findById(Number(req.auth.sub));
            res.json({ ...user, password: undefined });
            this.logger.info("Fetched self info", { id: req.auth.sub });
        } catch (err) {
            this.logger.error("Error fetching self info", { error: err });
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
            };

            const user = await this.userService.findById(Number(req.auth.sub));
            if (!user) {
                return next(createHttpError(400, "User with the token could not be found"));
            }

            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);

            // delete old refresh token when refreshing
            if (req.auth.id) {
                await this.tokenService.deleteRefreshToken(Number(req.auth.id));
                this.logger.info("Old refresh token deleted", { id: req.auth.id });
            }

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id),
            );

            this.cookieService.setTokens(res, accessToken, refreshToken, String(user.id));

            res.status(200).json({ id: user.id });
            this.logger.info("Access token refreshed successfully", { id: user.id });
        } catch (err) {
            this.logger.error("Error refreshing access token", { error: err });
            next(err);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction){
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id))
            this.logger.info("user has been logged out", {id:req.auth.sub})
            res.clearCookie("accessToken")
            res.clearCookie("refreshToken")
            res.json({})
        } catch (error) {
            next(error)
            return
        }
    }
}