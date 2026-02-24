import { checkSchema } from "express-validator";

export default checkSchema({
  firstName: {
    trim: true,
    notEmpty: {
      errorMessage: "First name is required",
    },
  },
  lastName: {
    trim: true,
    notEmpty: {
      errorMessage: "Last name is required",
    },
  },
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
  isLength: {
    options: { min: 8 },
    errorMessage: "Password must be at least 8 characters long",
  },
  },
});