const wallet = require('../wallet/walletApp');

// HLC
/// ff997b689d5e27bb20dcff4192c2f9f129776b1aea8439a638c6510f5bdfb789 
/// RmUTESAVnvSLuxd5zyQDdjgnYQQW69HukGG
/// zebra slim surface deny tiny talk lock paper dose noodle salmon time number remain hill explain defy crack cover pear volcano used taste cram

const w = wallet.create('111111', 'HLC', 'ff997b689d5e27bb20dcff4192c2f9f129776b1aea8439a638c6510f5bdfb789');
console.log(w);
console.log(wallet.toMnemonic('111111', '294b604c92ef1bb5bdaaff23fba479e60e5ad1105ceb733374530662affd6a51d9c4427fd12e524f315b31f3ab22ca4a3e2f5c4ba0e5c8c6808164e269518d1bbe010866d988e17594399d11d6e81c659777235233b219e5869b5d8d8f03e4d6e67664433d93773bfcc49c9cd442231642a1aa3c1ed2e9e0c937c3e5fb019828ade979aceea4b52ae8715c19b24541676b9ff00dcd35e97d796922411cb346e1053611ab2008ab28669e017bf7217413'));

const w2 = wallet.create('111111', 'BTC', 'ff997b689d5e27bb20dcff4192c2f9f129776b1aea8439a638c6510f5bdfb789');
console.log(w2);
console.log(wallet.toMnemonic('111111', 'c5b478044640090c6c76e1ab213c98580952d18cf8bfbbfd6586a4436e8c3161db379d328d316a94e7603112c1e8a08e01f35ef10b844220644814ff0ee95b6a8462d63948f14ea9e82c364978492b45842ac30233e86244ae5a1c2e3bda7cf5573578a73447e3f59ee9c62f7ac5bb9e57cc1ad304e4f5dcba7b790797daa2e99c5969ae71d34ba520402cc8496accbc7e8fe2055bed5c89ea9c1afe12b363b2a9903744b9c5c3bd24d7ca7b36277a07'));

const w3 = wallet.fromMnemonic('111111','HLC', 'zebra slim surface deny tiny talk lock paper dose noodle salmon time number remain hill explain defy crack cover pear volcano used taste cram');
console.log(w3);

const w4 = wallet.fromMnemonic('111111','BTC', 'zebra slim surface deny tiny talk lock paper dose noodle salmon time number remain hill explain defy crack cover pear volcano used taste cram');
console.log(w4);