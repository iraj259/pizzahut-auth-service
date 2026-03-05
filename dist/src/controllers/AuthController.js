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
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
const CookieService_1 = require("../services/CookieService");
const contants_1 = require("../contants");
class AuthController {
    constructor(userService, logger, credentialService, tokenService) {
        this.userService = userService;
        this.logger = logger;
        this.credentialService = credentialService;
        this.tokenService = tokenService;
        this.cookieService = new CookieService_1.CookieService(logger); // instantiate
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty())
                    return res.status(400).json({ errors: errors.array() });
                const { firstName, lastName, email, password } = req.body;
                const user = yield this.userService.create({
                    firstName,
                    lastName,
                    email,
                    password,
                    role: contants_1.Roles.CUSTOMER
                });
                this.logger.info("User created in DB", { id: user.id });
                const payload = {
                    sub: String(user.id),
                    role: user.role,
                };
                const accessToken = this.tokenService.generateAccessToken(payload);
                const newRefreshToken = yield this.tokenService.persistRefreshToken(user);
                const refreshToken = this.tokenService.generateRefreshToken(payload, String(newRefreshToken.id));
                this.cookieService.setTokens(res, accessToken, refreshToken, String(user.id));
                res.status(201).json({ id: user.id });
                this.logger.info("User registered successfully", { id: user.id });
            }
            catch (err) {
                this.logger.error("Error during user registration", { error: err });
                next(err);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty())
                    return res.status(400).json({ errors: errors.array() });
                const { email, password } = req.body;
                const user = yield this.userService.findByEmailWithPassword(email);
                if (!user)
                    return next((0, http_errors_1.default)(400, "Email or password does not match"));
                const match = yield this.credentialService.comparePassword(password, user.password);
                if (!match)
                    return next((0, http_errors_1.default)(400, "Email or password does not match"));
                const payload = {
                    sub: String(user.id),
                    role: user.role,
                };
                const accessToken = this.tokenService.generateAccessToken(payload);
                const newRefreshToken = yield this.tokenService.persistRefreshToken(user);
                const refreshToken = this.tokenService.generateRefreshToken(payload, String(newRefreshToken.id));
                this.cookieService.setTokens(res, accessToken, refreshToken, String(user.id));
                res.status(200).json({ id: user.id });
                this.logger.info("User logged in successfully", { id: user.id });
            }
            catch (err) {
                this.logger.error("Error during user login", { error: err });
                next(err);
            }
        });
    }
    self(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.findById(Number(req.auth.sub));
                res.json(Object.assign(Object.assign({}, user), { password: undefined }));
                this.logger.info("Fetched self info", { id: req.auth.sub });
            }
            catch (err) {
                this.logger.error("Error fetching self info", { error: err });
            }
        });
    }
    refresh(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = {
                    sub: req.auth.sub,
                    role: req.auth.role,
                };
                const user = yield this.userService.findById(Number(req.auth.sub));
                if (!user) {
                    return next((0, http_errors_1.default)(400, "User with the token could not be found"));
                }
                const accessToken = this.tokenService.generateAccessToken(payload);
                const newRefreshToken = yield this.tokenService.persistRefreshToken(user);
                // delete old refresh token when refreshing
                if (req.auth.id) {
                    yield this.tokenService.deleteRefreshToken(Number(req.auth.id));
                    this.logger.info("Old refresh token deleted", { id: req.auth.id });
                }
                const refreshToken = this.tokenService.generateRefreshToken(payload, String(newRefreshToken.id));
                this.cookieService.setTokens(res, accessToken, refreshToken, String(user.id));
                res.status(200).json({ id: user.id });
                this.logger.info("Access token refreshed successfully", { id: user.id });
            }
            catch (err) {
                this.logger.error("Error refreshing access token", { error: err });
                next(err);
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.tokenService.deleteRefreshToken(Number(req.auth.id));
                this.logger.info("user has been logged out", { id: req.auth.sub });
                res.clearCookie("accessToken");
                res.clearCookie("refreshToken");
                res.json({});
            }
            catch (error) {
                next(error);
                return;
            }
        });
    }
}
exports.AuthController = AuthController;
