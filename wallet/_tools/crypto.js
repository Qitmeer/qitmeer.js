const crypto = require('crypto');

class Crypto {
    constructor() {
        this.stringPrototype();
    }

    stringPrototype() {
        Object.assign(String.prototype, {
            toMD5() {
                return crypto.createHash("md5").update(this.valueOf()).digest('hex');
            },
            encrypt(password) {
                let result = "";
                const cipher = crypto.createCipheriv("aes-128-cbc", Buffer.from(password.toMD5(), "hex"), Buffer.from("Wallet App".toMD5(), "hex"));
                result += cipher.update(this.valueOf(), "utf8", "hex");
                result += cipher.final("hex");
                return result;
            },
            decrypt(password) {
                let result = "";
                try {
                    const cipher = crypto.createDecipheriv("aes-128-cbc", Buffer.from(password.toMD5(), "hex"), Buffer.from("Wallet App".toMD5(), "hex"));
                    result += cipher.update(this.valueOf(), "hex", "utf8");
                    result += cipher.final("utf8");
                } catch (e) {
                    result = false;
                }
                return result;
            }
        });
    }
}

module.exports = Crypto;