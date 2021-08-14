const bscSend = require('./bsc');

const coinSecrets = {
  address: 'MySendingBSCaddress',
  privateKey: 'MyPrivateKey',
};

const receivers = ['ADDR1', 'ADDR2'];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function massSending() {
  // eslint-disable-next-line no-restricted-syntax
  for (const receiver of receivers) {
    const amountToSend = 1;
    const gasLimit = 100000;
    const gasPrice = 6;
    // eslint-disable-next-line no-await-in-loop
    const result = await bscSend.sendBsc(receiver, amountToSend, gasLimit, gasPrice, coinSecrets, false); // false as for mainnet
    console.log(result);
    // eslint-disable-next-line no-await-in-loop
    await delay(30000); // wait 30s
  }
}

massSending();
