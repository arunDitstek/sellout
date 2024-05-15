import Joi from "@hapi/joi";

// Email Validation
export const email = Joi.string()
  .required()
  .email({ tlds: { allow: false } })
  .error(() => {
    return new Error("Please enter a valid email.");
  });

// Password Validation
// could force users to be more secure ->
// https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
export const password = Joi.string()
  .required()
  .min(8)
  .max(30)
  .error((errors: any) => {
    return errors.map((error: any) => {
      console.log(error);
      switch (error.code) {
        case "string.min":
          return new Error("Password must be greater than 8 Characters.");
        case "string.max":
          return new Error("Password must be fewer than 30 characters.");
        case "string.empty":
          return new Error("Please enter a password.");
        default:
          return new Error("Password validation error.");
      }
    });
  });

// full name validation - only checks for first and last name via single space character
// all characters are valid, gotta support X Æ A-12 now
// should maybe fix, idk, it accepts stuff like Mike\tPollard
export const fullName = Joi.string()
  .required()
  .pattern(new RegExp("^[^\\s]+(\\s[^\\s]+)+$"))
  .error(() => {
    return new Error("Please enter your first and last name");
  });

// Phone number validation, need to test internationally
export const phoneNumber = Joi.string()
  .required()
  .pattern(
    new RegExp(
      "^(\\+\\d{1,2}\\s?)?1?\\-?\\.?\\s?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$"
    )
  )
  .error(() => {
    return new Error("Please enter a valid phone number.");
  });
