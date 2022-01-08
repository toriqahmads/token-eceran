const orders = require('./orders');

module.exports = (app) => {
  /* GET home page. */
  app.get('/', function (req, res, next) {
    return res.status(200).json({ status: true });
  });

  app.use('/orders', orders);
}