import Joi from "@hapi/joi";

export const email = () => Joi.string().email({ tlds: { allow: false }});
export const password = () => Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"));

// export const exists = function (value) {
//   if (!value) return false;
//   return (value.length > 0);
// };

// export const fullName = function (value) {
//   if (!value) return false;
//   const fullNameReg = /[^\s]+\s[^\s]+/;
//   return (fullNameReg.test(value));
// };

// // Only works with US phone numbers and others of same length
// export const phoneNumber = function (value) {
//   if (!value) return false;
//   return (value.length === 12 || value.length === 14);
// };

// export const url = function (value) {
//   if (!value) return false;
//   const urlReg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
//   return (urlReg.test(value));
// };

// export const zipCode = function (value) {
//   if (!value) return false;
//   const zipReg = /^\d{5}(-\d{4})?$/;
//   return (zipReg.test(value));
// };
