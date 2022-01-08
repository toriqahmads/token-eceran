const path = require('path');
const crypto = require("crypto");
const { Worker } = require('worker_threads');
const hashType = process.env.PAYMENT_GATEWAY_HASH_TYPE;
const privateKey = process.env.PAYMENT_GATEWAY_PRIVATE_KEY;
const HmacSHA256 = crypto.createHmac(hashType, privateKey);

const checkSignature = async (json, _signature) => {
    try {
        const signature = HmacSHA256.update(json).digest("hex");

        if (signature != _signature) {
            throw flaverr(`E_BAD_REQUEST`, new Error('invalid signature'));
        }

        return Promise.resolve(true);
    } catch (err) {
        return Promise.reject(err);
    }
};

const processOrder = async (headers, body) => {
    try {
        await checkSignature(body, headers['HTTP_X_CALLBACK_SIGNATURE']);
        const event = headers['HTTP_X_CALLBACK_EVENT'];

        if (event == 'payment_status') {
            // get invoice from db
            const invoice = await Invoice_Order.findByPk(body.merchant_ref, { transaction });
            if (body.status == 'PAID') {
                if (parseFloat(body.total_amount) == parseFloat(invoice.total_amount)) {
                    invoice.status = 'PAID';
                    new Worker(path.resolve(`app/workers/order_processor`), {
                        workerData: {
                            merchant_ref
                        }
                    });
                } else {
                    throw flaverr(`E_BAD_REQUEST`, new Error(`invalid total amount`));
                }
            } else if(body.status == 'EXPIRED' || body.status == 'FAILED') {
                invoice.status = 'CANCELLED';
            } else {
                invoice.status = 'CANCELLED';
            }
            
            await invoice.save({ transaction });
        }  

        return Promise.resolve(true);                     
    } catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    processOrder
};