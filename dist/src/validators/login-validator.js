"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = (0, express_validator_1.checkSchema)({
    email: {
        trim: true,
        notEmpty: {
            errorMessage: "Email is required",
        },
        isEmail: {
            errorMessage: "Invalid email format",
        },
    },
    password: {
        trim: true,
        notEmpty: { errorMessage: "Password is required" },
    },
});
