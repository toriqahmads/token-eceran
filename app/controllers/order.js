const flaverr = require('flaverr');
const { sendBnb } = require('../services/wallet');
const { getPrice } = require('../services/coingecko');

module.exports = {
    async create(req, res, next) {
        try {
            const { addressTo, orderTotal } = req.query;
            const price = await getPrice('binancecoin', 'idr');

            const getBnb = orderTotal/price.binancecoin.idr;
            const sendOrder = await sendBnb(addressTo, getBnb);

            return res.status(200).json({
                status: true,
                data: sendOrder
            });
        } catch (err) {
            return next(err);
        }
    }
}