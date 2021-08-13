const config = require('config');
const Web3 = require('web3');
const abi = require('abi');
const EthereumTx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common').default;
const BigNumber = require('bignumber.js');
const axios = require('axios');

const coinConfig = {
  node: 'https://bsc-dataseed1.binance.org',
  testnetNode: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  gasLimit: 120000,
  gasPrice: 6,
  testnet: false,
  contract: '0xaff9084f2374585879e8b434c399e29e80cce635',
  testnetContract: '0x690cc0235abea2cf89213e30d0f0ea0fc054b909',
},

const coinConfig = config.coins.bsc;

const defaultGasPrice = coinConfig.gasPrice;
const defaultGasLimit = coinConfig.gasLimit;

// returns false if fail, txid if success
// string, number, number, number, string (chainID is string!), string, string, string
async function sendBsc(receiver, value, gasLimit = defaultGasLimit, gasPrice = defaultGasPrice, coinSecrets, isTestnet = coinConfig.testnet) {
  const nodeService = isTestnet ? coinConfig.testnetNode : coinConfig.node;
  const contract = isTestnet ? coinConfig.testnetContract : coinConfig.contract;
  try {
    const myPrivateKey = coinSecrets.privateKey;
    const myAddress = coinSecrets.address;
    let errString = '';
    // Validation
    if (value === '') {
      errString += 'Invalid Amount';
    }
    if (value <= 0) {
      errString += 'Invalid Amount';
    }
    if (receiver.length !== 42 || receiver[0] !== '0' || receiver[1] !== 'x') {
      errString += 'Invalid receiver';
    }
    if (errString !== '') {
      throw new Error(errString);
    }

    const gasPriceWei = Number(gasPrice) * 1e9;

    // connect to Infura node
    const web3 = new Web3(new Web3.providers.HttpProvider(nodeService));

    const tokenContract = new web3.eth.Contract(abi.standard, contract, {
      from: myAddress,
    });

    // get the number of transactions sent so far so we can create a fresh nonce
    const nonce = await web3.eth.getTransactionCount(myAddress);
    console.log(`obtained Nonce: ${nonce}`);
    // construct the transaction data
    const decimals = (10 ** 8);
    const decimalsBN = new BigNumber(decimals.toString());
    const valueBN = new BigNumber(value);
    const weivalueBN = valueBN.multipliedBy(decimalsBN);
    const weivalueHex = web3.utils.toHex(weivalueBN);
    console.log(weivalueHex);

    const txData = {
      nonce: web3.utils.toHex(nonce),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(gasPriceWei),
      to: contract,
      from: myAddress,
      value: '0x00',
      data: tokenContract.methods.transfer(receiver, weivalueHex).encodeABI(),
    };
    console.log(txData);

    const privateKey = Buffer.from(myPrivateKey, 'hex');
    web3.eth.defaultAccount = myAddress;
    const bscCommon = Common.forCustomChain(
      'mainnet',
      {
        name: 'Binance Smart Chain',
        chainId: 56,
      },
      'petersburg',
    );
    const bscCommonTestnet = Common.forCustomChain(
      'ropsten',
      {
        name: 'Binance Smart Chain',
        chainId: 97,
      },
      'petersburg',
    );

    let transaction;
    if (isTestnet) {
      transaction = new EthereumTx(txData, { common: bscCommonTestnet });
    } else {
      transaction = new EthereumTx(txData, { common: bscCommon });
    }

    transaction.sign(privateKey);
    const serializedTx = transaction.serialize();
    const serializedTxHex = serializedTx.toString('hex');
    console.log(serializedTxHex);
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const id = Math.floor((Math.random() * 1000000));
    const data = {
      jsonrpc: '2.0', method: 'eth_sendRawTransaction', params: [`0x${serializedTxHex}`], id,
    };
    const response = await axios.post(nodeService, data, axiosConfig);
    const txid = response.data.result;
    console.log(txid);
    return txid;
  } catch (error) {
    return error;
  }
}

module.exports = {
  sendBsc,
};
