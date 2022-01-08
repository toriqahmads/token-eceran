const flaverr = require('flaverr');
const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

module.exports = {
    /**
     * 
     * @param {String|String[]} _coinIds string or array containing id of coins 
     * @param {String|String[]} _currencies string or array contraining id of currencies
     * @returns {Promise} 
     */
    async getPrice(_coinIds, _currencies) {
        try {
            if (typeof _coinIds == 'string') _coinIds = [_coinIds];
            if (typeof _currencies == 'string') _currencies = [_currencies];

            const data = await CoinGeckoClient.simple.price({
                ids: _coinIds,
                vs_currencies: _currencies
            });

            if (!data.success || data.message != 'OK' || data.code != 200 || _.isEmpty(data.data)) {
                throw flaverr(`E_NOT_FOUND`, new Error(`coin price not found`));
            }

            return Promise.resolve(data.data);
        } catch(err) {
            return Promise.reject(err);
        }
    } 
};