"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDiscount = void 0;
exports.validateNumericId = validateNumericId;
const calculateDiscount = (price, percentage) => {
    return price * (percentage / 100);
};
exports.calculateDiscount = calculateDiscount;
const http_errors_1 = __importDefault(require("http-errors"));
function validateNumericId(id) {
    if (!id || Array.isArray(id)) {
        throw (0, http_errors_1.default)(400, 'Invalid url param.');
    }
    const parsedId = Number(id);
    if (Number.isNaN(parsedId) || !Number.isInteger(parsedId)) {
        throw (0, http_errors_1.default)(400, 'Invalid url param.');
    }
    return parsedId;
}
