const flaverr = require('flaverr');
const { workerData } = require('worker_threads');
const { sendBnb } = require('../services/wallet');
const { getPrice } = require('../services/coingecko');
const { Invoice_Order, Sequelize, sequelize } = require('../models');

/**
 * Sending product from order by merchant_ref (invoice number)
 * @param {String} merchant_ref invoice number of order
 * @returns {Promise}
 */
const processOrder = async (merchant_ref) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const invoice = await Invoice_Order.findByPk(merchant_ref, { transaction: t });

            if (!invoice) {
                throw flaverr(`E_NOT_FOUND`, Error(`invoice ${merchant_ref} not found`));
            }

            if (invoice.status != 'PAID') {
                throw flaverr(`E_FORBIDDEN`, Error(`can't process order before paid`));
            }

            const price = await getPrice('binancecoin', 'idr');

            const getBnb = invoice.total_amount/price.binancecoin.idr;
            const sendOrder = await sendBnb(invoice.address_to, getBnb);

            invoice.status = 'FINISHED';
            invoice.txhash = sendOrder;

            await invoice.save({ transaction: t });

            return sendOrder;
        });

        return Promise.resolve(result);
    } catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Sending product from pending order
 * @returns {Promise}
 */
const processPendingOrder = async () => {
    try {
        const invoices = await Invoice_Order.findAll({
            where: {
                status: { [Sequelize.Op.eq]: 'PAID' }
            },
            attributes: ['id'],
            order: [['created_at', 'ASC']],
            raw: true
        });

        if (invoices.length < 1) {
            throw flaverr(`E_NOT_FOUND`, Error(`no pending transaction to be processed`));
        }

        const txreceipts = [];
        for (let invoice of invoices) {
            const sendOrder = await processOrder(invoice.id);
            txreceipts.push(sendOrder);
        }

        if (txreceipts.length < 1) {
            throw flaverr(`E_ERROR`, Error(`failed to process pending orders`));
        }

        return Promise.resolve(result);
    } catch (err) {
        return Promise.reject(err);
    }
}

(async () => {
    try {
        const { merchant_ref } = workerData;

        if (merchant_ref && merchant_ref != '') {
            await processOrder(merchant_ref);
        } else {
            await processPendingOrder();
        }
    } catch (err) {
        console.log(err);
    }
})();