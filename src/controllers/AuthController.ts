import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { TokenService } from "../services/TokenService";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private credentialService: CredentialService,
        private tokenService: TokenService,
    ) {}

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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id),
            );

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

            this.logger.info("User registered", { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (err) {
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
                return next(
                    createHttpError(400, "Email or password does not match"),
                );

            const match = await this.credentialService.comparePassword(
                password,
                user.password,
            );
            if (!match)
                return next(
                    createHttpError(400, "Email or password does not match"),
                );

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id),
            );

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

            this.logger.info("User logged in", { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (err) {
            next(err);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        res.json({ ...user, password: undefined });
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
        // delete old refresh token when refreshing the access token so new refresh is created
        await this.tokenService.deleteRefreshToken(Number(req.auth.id))
        const refreshToken = this.tokenService.generateRefreshToken(
            payload,
            String(newRefreshToken.id),
        );

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

        res.status(200).json({ id: user.id });
    } catch (err) {
        next(err);
    }
}
}
