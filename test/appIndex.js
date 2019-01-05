const wallet = require('../wallet/walletApp');

// HLC
/// ff997b689d5e27bb20dcff4192c2f9f129776b1aea8439a638c6510f5bdfb789 
/// RmUTESAVnvSLuxd5zyQDdjgnYQQW69HukGG
/// zebra slim surface deny tiny talk lock paper dose noodle salmon time number remain hill explain defy crack cover pear volcano used taste cram

// const w = wallet.create('111111', 'HLC', 'ff997b689d5e27bb20dcff4192c2f9f129776b1aea8439a638c6510f5bdfb789');
// console.log(w);
// console.log(wallet.toMnemonic('111111', '294b604c92ef1bb5bdaaff23fba479e60e5ad1105ceb733374530662affd6a51d9c4427fd12e524f315b31f3ab22ca4a3e2f5c4ba0e5c8c6808164e269518d1bbe010866d988e17594399d11d6e81c659777235233b219e5869b5d8d8f03e4d6e67664433d93773bfcc49c9cd442231642a1aa3c1ed2e9e0c937c3e5fb019828ade979aceea4b52ae8715c19b24541676b9ff00dcd35e97d796922411cb346e1053611ab2008ab28669e017bf7217413'));
//
// const w2 = wallet.create('111111', 'BTC', 'ff997b689d5e27bb20dcff4192c2f9f129776b1aea8439a638c6510f5bdfb789');
// console.log(w2);
// console.log(wallet.toMnemonic('111111', 'c5b478044640090c6c76e1ab213c98580952d18cf8bfbbfd6586a4436e8c3161db379d328d316a94e7603112c1e8a08e01f35ef10b844220644814ff0ee95b6a8462d63948f14ea9e82c364978492b45842ac30233e86244ae5a1c2e3bda7cf5573578a73447e3f59ee9c62f7ac5bb9e57cc1ad304e4f5dcba7b790797daa2e99c5969ae71d34ba520402cc8496accbc7e8fe2055bed5c89ea9c1afe12b363b2a9903744b9c5c3bd24d7ca7b36277a07'));
//
// const w3 = wallet.fromMnemonic('111111','HLC', 'zebra slim surface deny tiny talk lock paper dose noodle salmon time number remain hill explain defy crack cover pear volcano used taste cram');
// console.log(w3);
//
// const w4 = wallet.fromMnemonic('111111','BTC', 'zebra slim surface deny tiny talk lock paper dose noodle salmon time number remain hill explain defy crack cover pear volcano used taste cram');
// console.log(w4);

// const temp = "35e16a3165dd689dcf74185a20caa9fde617878d2d03cb4d164323a4591aac1fcb280d87f454ed6e9f786e9d307664ebcbf5dd4d973116ee058025a112674d512b1054a62637437077d8d1864f98378d7863549328e9acec74b65d9808f0442da2df461259922f0f3e3edef55ca0612c7921b40a9b651148ba161e202714b44298f18ed32de9871e0dc15596aade219dd0bea3c7274e6fe32eb517b30b128d3069d7794eb2c341ef55f444625a3ef19eab7f6bc798098d297f124a9b098c5b5ba29f3cd2d4430da6e5173ae7d86a8142".decipher("111111");
// console.log(temp);

let data = {
    "utxos" : [
        {
            "vout" : 1,
            "amount" : 7957200000,
            "confirmations" : 2,
            "address" : "RmJWrmDQywFjEHTnAdWkvJq3CXZqvZRfMCo",
            "txid" : "8e65b63d60285819314c4ff7fbd7529833bc5aef43ba37d8f3f7d814cf3b78aa"
        }
    ],
    "to" : "Rm9U3KnWfbyMzUiW1mKYjf1rvnhye35cG6H",
    "value" : 10,
    "fees" : 0.214
};
let row = wallet.transaction('111111'
    ,'35e16a3165dd689dcf74185a20caa9fde617878d2d03cb4d164323a4591aac1ff68dfd31b5d0c727b64ac7fb6709836376bd8923fad3ba059b4d2a9a0ad995e0126bd1ed6879dd7a00249996ab6130c8d5df98b08e853394cb0dfd182022b034b6913df89e0c79443373b3c7bce5873d170b0cf3dda39bc101eaea755c45d5e608a5d8fbc514e592de48ecb3e5d0414450d951b8a5d0a9c1af45a113d045ebd139ef80c6f37d6ff2907043d8fc791af170b0c91b938a7a748dd9f9caa35f787db8773be9ed6c5fbec77b24892f4ce5b8'
    ,data);
console.log(row);