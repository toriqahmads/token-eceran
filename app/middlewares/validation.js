const flaverr = require('flaverr');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  try {
    errors.array().map((err) => {
      throw flaverr('E_VALIDATION', Error(`${err.param}: ${err.msg}`));
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = validate;
