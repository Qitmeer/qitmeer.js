const nox = require('noxjs-lib');

const txObj = {
    fromAddr: "RmFa5hnPd3uQRpzr3xWTfr8EFZdX7dS1qzV",
    toAddr: "RmFFPyB23V5ryGmEdtijdCQp189khqUAWUt",
    value: 300,
    fees: 0.1,
    keyPair: nox.ec.fromWIF("L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC"),
    version: nox.networks.privnet.pubKeyHashAddrId,
    utxo: [
        {
            txid: "628c8e507399213a03318ba9bbd290bf1119106d441396d9494af8100dec3575",
            vout: 2,
            amount: 45000000000
        }
    ]
}

function txSign(from, to, value, fees) {
    const txb = nox.txsign.newSigner();
    txb.setVersion(txObj.version);

    const fullValue = value * 100000000;
    const fullFees = fees * 100000000;

    let total = 0;
    txObj.utxo.map(item => {
        total += item.amount;
        txb.addInput(item.txid, item.vout);
    });

    txb.addOutput(to, fullValue);
    const balance = total - fullValue - fullFees;
    if (balance > 0) { txb.addOutput(from, balance);}
    txObj.utxo.map((item, i) => {
        txb.sign(i, txObj.keyPair);
    });
    return txb.build().toBuffer().toString('hex');
}

const txhex = txSign(txObj.fromAddr, txObj.toAddr, txObj.value, txObj.fees);
console.log(txhex);