require('dotenv').config();
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const helmet = require('helmet');
const router = require('./routes');
const express = require('express');
const passport = require('passport');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const { notFound, errorStack } = require('./app/middlewares/errorHandlers');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// models setup
require('./app/models');

// global setup
global._ = require('lodash');

// parsing setup
app.use(logger('dev'));
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(expressValidator());

// // passport setup
// require('./app/passports/jsonwebtoken')(passport);

//Prevent CORS ERROR
app.use(cors());

//use helmet
app.use(helmet());

//router
router(app);

app.use(notFound);
app.use(errorStack);

module.exports = app;