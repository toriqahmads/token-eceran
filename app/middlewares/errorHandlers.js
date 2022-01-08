const flaverr = require('flaverr');

// route not found
const notFound = (req, res, next) => {
  const error = flaverr('E_NOT_FOUND', Error(`Not found - ${req.originalUrl}`));
  return next(error);
};

// error handler
const errorStack = (error, req, res, next) => {
  let statusCode;

  switch (error.code) {
    case 'E_BAD_REQUEST':
      statusCode = 400;
      break;

    case 'E_DUPLICATE':
      statusCode = 400;
      break;

    case 'E_CAPTCHA':
      statusCode = 400;
      break;

    case 'E_VALIDATION':
      statusCode = 422;
      break;

    case 'E_NOT_FOUND':
      statusCode = 404;
      break;

    case 'E_INVALID_TOKEN':
      statusCode = 401;
      break;

    case 'E_UNAUTHORIZED':
      statusCode = 401;
      break;

    case 'E_FORBIDDEN':
      statusCode = 403;
      break;

    case 'E_ENCRYPT_KEY':
      statusCode = 500;
      break;

    case 'E_ERROR':
      statusCode = 500;
      break;

    default:
      statusCode = 500;
      break;
  }

  res.status(statusCode);

  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 422;
    res.status(statusCode);

    error.code = 'E_DUPLICATE';
    error.message = error.errors[0].message;
  }

  return res.json({
    statusCode,
    code: error.code,
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '' : error.stack,
  });
};

module.exports = {
  notFound,
  errorStack,
};
