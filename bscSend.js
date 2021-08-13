const coinSecrets = {
  address: 'MySendingBSCaddress',
  privateKey: 'MyPrivateKey',
};

const receivers = ['ADDR1', 'ADDR2']

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function massSending() {
  for (const receiver of receivers) {
    const amountToSend = 1;
    const gasLimit = 100000;
    const gasPrice = 6;
    const result = await bscSend.sendBsc(receiver, amountToSend, gasLimit, gasPrice, coinSecrets, false); // false as for mainnet
    console.log(result);
    await delay(30000); // wait 30s
  }
}

massSending();
