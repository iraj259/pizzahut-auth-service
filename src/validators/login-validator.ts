import { checkSchema } from "express-validator";

export default checkSchema({
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