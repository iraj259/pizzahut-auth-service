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
exports.UserController = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const express_validator_1 = require("express-validator");
class UserController {
    constructor(userService, logger) {
        this.userService = userService;
        this.logger = logger;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password, tenantId, role } = req.body;
            try {
                const user = yield this.userService.create({
                    firstName,
                    lastName,
                    email,
                    password,
                    role,
                    tenantId
                });
                res.status(201).json({ id: user.id });
            }
            catch (error) {
                next(error);
            }
        });
    }
    destroy(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            if (isNaN(Number(userId))) {
                return next((0, http_errors_1.default)(400, "Invalid url param."));
            }
            try {
                yield this.userService.deleteById(Number(userId));
                res.json({ id: Number(userId) });
            }
            catch (err) {
                next(err);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // In our project: We are not allowing user to change the email id since it is used as username
            // In our project: We are not allowing admin user to change others password
            // Validation
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
            const { firstName, lastName, role } = req.body;
            const userId = req.params.id;
            if (isNaN(Number(userId))) {
                next((0, http_errors_1.default)(400, "Invalid url param."));
                return;
            }
            this.logger.debug("Request for updating a user", req.body);
            try {
                yield this.userService.update(Number(userId), {
                    firstName,
                    lastName,
                    role,
                });
                this.logger.info("User has been updated", { id: userId });
                res.json({ id: Number(userId) });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.UserController = UserController;
