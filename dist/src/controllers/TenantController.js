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
exports.TenantController = void 0;
const express_validator_1 = require("express-validator");
const http_errors_1 = __importDefault(require("http-errors"));
class TenantController {
    constructor(tenantService, logger) {
        this.tenantService = tenantService;
        this.logger = logger;
    }
    create(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validation
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
            const { name, address } = req.body;
            this.logger.debug("Request for creating a tenant", req.body);
            try {
                const tenant = yield this.tenantService.create({ name, address });
                this.logger.info('Tenant has been created', { id: tenant.id });
                res.status(201).json({ id: tenant.id });
            }
            catch (error) {
                next(error);
            }
        });
    }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validation
            const result = (0, express_validator_1.validationResult)(req);
            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }
            const { name, address } = req.body;
            const tenantId = req.params.id;
            if (isNaN(Number(tenantId))) {
                next((0, http_errors_1.default)(400, "Invalid url param."));
                return;
            }
            this.logger.debug("Request for updating a tenant", req.body);
            try {
                yield this.tenantService.update(Number(tenantId), {
                    name,
                    address,
                });
                this.logger.info("Tenant has been updated", { id: tenantId });
                res.json({ id: Number(tenantId) });
            }
            catch (err) {
                next(err);
            }
        });
    }
    getAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const validatedQuery = (0, express_validator_1.matchedData)(req, { onlyValidData: true });
            try {
                const [tenants, count] = yield this.tenantService.getAll(validatedQuery);
                this.logger.info("All tenant have been fetched");
                res.json({
                    currentPage: validatedQuery.currentPage,
                    perPage: validatedQuery.perPage,
                    total: count,
                    data: tenants,
                });
                res.json(tenants);
            }
            catch (err) {
                next(err);
            }
        });
    }
    getOne(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenantId = req.params.id;
            if (isNaN(Number(tenantId))) {
                next((0, http_errors_1.default)(400, "Invalid url param."));
                return;
            }
            try {
                const tenant = yield this.tenantService.getById(Number(tenantId));
                if (!tenant) {
                    next((0, http_errors_1.default)(400, "Tenant does not exist."));
                    return;
                }
                this.logger.info("Tenant has been fetched");
                res.json(tenant);
            }
            catch (err) {
                next(err);
            }
        });
    }
    destroy(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const tenantId = req.params.id;
            if (isNaN(Number(tenantId))) {
                next((0, http_errors_1.default)(400, "Invalid url param."));
                return;
            }
            try {
                yield this.tenantService.deleteById(Number(tenantId));
                this.logger.info("Tenant has been deleted", {
                    id: Number(tenantId),
                });
                res.json({ id: Number(tenantId) });
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.TenantController = TenantController;
