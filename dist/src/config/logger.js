"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const index_1 = require("./index");
const logger = winston_1.default.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports: [
        // log storage
        new winston_1.default.transports.File({
            level: "info",
            dirname: "logs",
            filename: "combined.log",
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            silent: index_1.Config.NODE_ENV === 'test',
        }),
        new winston_1.default.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            silent: index_1.Config.NODE_ENV === 'test',
        }),
        new winston_1.default.transports.Console({
            level: "info",
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            silent: index_1.Config.NODE_ENV === 'test',
        }),
    ],
});
exports.default = logger;
