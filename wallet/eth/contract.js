/**
 * 合约
 * id:合约号
 * integer：取整
 * abi：合约abi
 */
//合约
const params = {
    hlc: {
        id: '0x58c69ed6cd6887c0225d1fccecc055127843c69b',
        integer: 1000000000,
        abi: [{
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [{"name": "", "type": "string"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
            "name": "approve",
            "outputs": [{"name": "success", "type": "bool"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"name": "", "type": "uint256"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "transferFrom",
            "outputs": [{"name": "success", "type": "bool"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [{"name": "", "type": "uint8"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "burnAmount", "type": "uint256"}],
            "name": "burn",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [{"name": "", "type": "string"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
            "name": "transfer",
            "outputs": [{"name": "success", "type": "bool"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
            "name": "allowance",
            "outputs": [{"name": "remaining", "type": "uint256"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "BURN_ADDRESS",
            "outputs": [{"name": "", "type": "address"}],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }, {
            "inputs": [{"name": "_owner", "type": "address"}, {"name": "_name", "type": "string"}, {
                "name": "_symbol",
                "type": "string"
            }, {"name": "_totalSupply", "type": "uint256"}, {"name": "_decimals", "type": "uint8"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "burner", "type": "address"}, {
                "indexed": false,
                "name": "burnedAmount",
                "type": "uint256"
            }],
            "name": "Burned",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": true, "name": "_from", "type": "address"}, {
                "indexed": true,
                "name": "_to",
                "type": "address"
            }, {"indexed": false, "name": "_value", "type": "uint256"}],
            "name": "Transfer",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": true, "name": "_owner", "type": "address"}, {
                "indexed": true,
                "name": "_spender",
                "type": "address"
            }, {"indexed": false, "name": "_value", "type": "uint256"}],
            "name": "Approval",
            "type": "event"
        }]

    },
    gzh: {
        id: '0xA732A941aC1D92aB4aD7234f0eb26e079ec45f85',
        integer: 100,
        abi: [{
            "constant": true,
            "inputs": [],
            "name": "name",
            "outputs": [{"name": "", "type": "string"}],
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
            "name": "approve",
            "outputs": [{"name": "success", "type": "bool"}],
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "totalSupply",
            "outputs": [{"name": "", "type": "uint256"}],
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
                "name": "_value",
                "type": "uint256"
            }],
            "name": "transferFrom",
            "outputs": [{"name": "success", "type": "bool"}],
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "decimals",
            "outputs": [{"name": "", "type": "uint8"}],
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "version",
            "outputs": [{"name": "", "type": "string"}],
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "type": "function"
        }, {
            "constant": true,
            "inputs": [],
            "name": "symbol",
            "outputs": [{"name": "", "type": "string"}],
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
            "name": "transfer",
            "outputs": [{"name": "success", "type": "bool"}],
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_spender", "type": "address"}, {
                "name": "_value",
                "type": "uint256"
            }, {"name": "_extraData", "type": "bytes"}],
            "name": "approveAndCall",
            "outputs": [{"name": "success", "type": "bool"}],
            "type": "function"
        }, {
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
            "name": "allowance",
            "outputs": [{"name": "remaining", "type": "uint256"}],
            "type": "function"
        }, {
            "inputs": [{"name": "_initialAmount", "type": "uint256"}, {
                "name": "_tokenName",
                "type": "string"
            }, {"name": "_decimalUnits", "type": "uint8"}, {"name": "_tokenSymbol", "type": "string"}],
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": true, "name": "_from", "type": "address"}, {
                "indexed": true,
                "name": "_to",
                "type": "address"
            }, {"indexed": false, "name": "_value", "type": "uint256"}],
            "name": "Transfer",
            "type": "event"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": true, "name": "_owner", "type": "address"}, {
                "indexed": true,
                "name": "_spender",
                "type": "address"
            }, {"indexed": false, "name": "_value", "type": "uint256"}],
            "name": "Approval",
            "type": "event"
        }]
    }
};

module.exports = params;