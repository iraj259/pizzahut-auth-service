"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.TokenService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const jsonwebtoken_1 = require("jsonwebtoken"); // Fixed import for sign
const config_1 = require("../config");
const http_errors_1 = __importDefault(require("http-errors"));
class TokenService {
    constructor(refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }
    generateAccessToken(payload) {
        let privateKey;
        try {
            privateKey = fs.readFileSync(path.join(__dirname, "../../certs/private.pem"));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (err) {
            throw (0, http_errors_1.default)(500, "Error while reading private key");
        }
        return (0, jsonwebtoken_1.sign)(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
    }
    generateRefreshToken(payload, tokenId) {
        return (0, jsonwebtoken_1.sign)(Object.assign(Object.assign({}, payload), { id: tokenId }), config_1.Config.REFRESH_TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
        });
    }
    persistRefreshToken(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
            const newToken = this.refreshTokenRepository.create({
                user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });
            return yield this.refreshTokenRepository.save(newToken);
        });
    }
    deleteRefreshToken(tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.refreshTokenRepository.delete({ id: tokenId });
        });
    }
}
exports.TokenService = TokenService;
