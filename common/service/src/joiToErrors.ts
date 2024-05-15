/*
 * Converts Joi error objects to a { key, message } type object (pb.Error, Object, etc.)
 */
const joiToErrors = (joiErrors, errorClass) => {
  const errors = joiErrors.details.map(detail => {
    const key = detail.path[0];
    const type = detail.type;

    // Note, these messages eventually need to be symbolic, and also localized / translated.
    // Right now, we're mainly using the English strings returned by the Joi validators.
    const defaultMessage = detail.message;
    const message = publicErrorMessage(key, type, defaultMessage);

    return new errorClass({ key, message });
  }, {});

  return errors;
};

/*
 * Override default Joi messages, which aren't always safe to show to our users.
 */
const publicErrorMessage = (key, type, defaultMessage) => {
  let message = defaultMessage;

  switch (type) {
    case "string.regex.base": {
      // regex errors echo back the value, which is dangerous for passwords
      message = `"${key}" does not meet the requirements`;
    }
  }

  return message;
};

/*
 * Function used for more detailed key info and custom error messages
 */
export const joiToErrorMessages = (joiErrors, errorClass) => {
  const errors = joiErrors.details.map(detail => {
    const key = detail.context.label;
    const message = detail.message;
    return new errorClass({ key, message });
  }, {});
  return errors;
};

export default joiToErrors;
