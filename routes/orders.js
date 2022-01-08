const express = require('express');
const router = express.Router();
const order = require('../app/controllers/order');

router.get('/', order.create);

module.exports = router;
