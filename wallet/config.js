const btc = require('./btc/index'),
    eth = require('./eth/index'),
    hlc = require('./hlc/index'),
    btcConfig = require('./btc/config'),
    ethConfig = require('./eth/config'),
    hlcConfig = require('./hlc/config'),
    contracts = require('./eth/contracts');//合约

const btcMain = btcConfig.mainnet,
    btcTest = btcConfig.testnet,
    ethMain = ethConfig.mainnet,
    ethTest = ethConfig.testnet,
    hlcPriv = hlcConfig.privnet;

const params = paramsTest = {btc: {}, eth: {}, hlc: {}};
params.eth.func = paramsTest.eth.func = eth;
params.hlc.func = paramsTest.hlc.func = hlc;
params.btc.func = paramsTest.btc.func = btc;

//正式
params.eth.list = {
    'eth': {config: ethMain},
    'hlc-token': {
        config: ethMain, contract: contracts['hlc-token']
    }
};
params.hlc.list = {};
// params.btc.list = {
//     'btc': {config: btcMain}
// };


//测试
paramsTest.eth.list = {
    'eth': {config: ethTest},
    'hlc-token': {
        config: ethTest, contract: contracts['hlc-token']
    }
};
paramsTest.hlc.list = {
    'hlc-coin': {config: hlcPriv}
};
paramsTest.btc.list = {
    'btc': {config: btcTest}
};


let paramsList = paramsTest;

/**
 * 循环
 * @param success 方法
 */
function foreach(success) {
    for (const typeName in paramsList) {
        if (paramsList.hasOwnProperty(typeName)) {
            const func = paramsList[typeName].func,
                list = paramsList[typeName].list;
            let isFirst = true;
            for (const name in list) {
                if (list.hasOwnProperty(name)) {
                    if (success) success(func, typeName, name, list[name], isFirst);
                    isFirst = false;
                }
            }
        }
    }
}

/**
 * 返回查找的参数
 * @param itemName
 */
function get(itemName) {
    let result = {};
    foreach(function (func, typeName, name, options) {
        if (name.toLowerCase() === itemName.toLowerCase()) {
            result = {func: func, typeName: typeName, name: name, options: options};
            return false;
        }
    });
    return result;
}

/**
 * 返回树形结构
 */
function getTree() {
    const params = {};
    foreach(function (func, typeName, name, options, isFirst) {
        if (isFirst) params[typeName] = [];
        params[typeName].push(name);
    });

    return params;
}

/**
 * 返回数组
 * @returns {Array}
 */
function getArray() {
    const params = [];
    foreach(function (func, typeName, name) {
        params.push(name);
    });

    return params;
}

module.exports = {
    params: paramsList, foreach, get, getTree, getArray
};