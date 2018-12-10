const Buffer = require('safe-buffer').Buffer


module.exports = {
    fromBase58Check

}

function fromBase58Check(version, hash) {
    return {
        version: version,
        hash: hash
    }
}