const Web3 = require('web3');
const ethers = require('ethers');

const web3 = new Web3(process.env.BSC_RPC_NETWORK);
const rpcProvider = new ethers.providers.Web3Provider(web3.currentProvider);

module.exports = {
    async sendBnb (to, value) {
        try {
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
            const account = wallet.connect(rpcProvider);
    
            const tx = await account.sendTransaction({
                to,
                value: ethers.utils.parseEther(value),
                gasLimit: process.env.GAS_LIMIT,
                gasPrice: ethers.utils.parseUnits(process.env.GAS_PRICE, 'gwei'),
            });
    
            await tx.wait();
    
            return Promise.resolve(tx.hash);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}