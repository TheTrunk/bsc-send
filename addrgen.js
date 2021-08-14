const bitgotx = require('bitgo-utxo-lib');
const bip32utils = require('bip32-utils');
const zelcorejs = require('zelcorejs');
const secp256k1 = require('secp256k1');
const {
  keccak256,
} = require('js-sha3');

const seedHex = 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'; // my super strong seed phrase
const numberOfAddresses = 100;

const hdNode = bitgotx.HDNode.fromSeedHex(seedHex);
const chain = new bip32utils.Chain(hdNode);

for (let k = 0; k < numberOfAddresses; k += 1) {
  chain.next();
}
// Get private keys in WIF from them
const privateKeysWIF = chain.getAll().map((x) => chain.derive(x).keyPair.toWIF());

// ADDRESS GENERATION
const addresses = [];
for (let addressNumber = 0; addressNumber < numberOfAddresses; addressNumber += 1) {
  let pk = privateKeysWIF[addressNumber];
  if (pk.length !== 64) {
    pk = zelcorejs.address.WIFToPrivKey(pk);
  }

  const pkbuffer = Buffer.from(pk, 'hex');
  const pubKeyETHbuffer = secp256k1.publicKeyCreate(pkbuffer, false).slice(1);
  const publicAddrETHFull = keccak256(pubKeyETHbuffer);
  const buf2 = Buffer.from(publicAddrETHFull, 'hex');
  const publicAddrETH = `0x${buf2.slice(-20).toString('hex')}`;
  // console.log(publicAddrETH);
  addresses.push(publicAddrETH);
}

console.log(JSON.stringify(addresses));
