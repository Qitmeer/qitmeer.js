class Core {
    static getInstance() {
        if (!Core.instance) {
            Core.instance = new Core();
        }
        return Core.instance;
    };

    //构造函数
    constructor() {
        this.prototypeString();
        // this.prototypeObject();
        this.prototypeNumber();
    }

    prototypeString() {
        //url处理参数
        //noinspection JSUnusedGlobalSymbols
        String.prototype.replaceUrl = function (json) {
            let url = this,
                lastLetter = url.substring(url.length - 1, url.length);
            if (json) {
                if (url.indexOf('?') >= 0) {
                    if (lastLetter !== '&') url = url + '&';
                } else {
                    url = url + '?';
                }
                for (const item in json) {
                    if (json.hasOwnProperty(item)) {
                        if (url.indexOf('{' + item + '}') >= 0) {
                            url = url.replace('{' + item + '}', json[item]);
                        } else {
                            url += item + '=' + json[item] + '&';
                        }
                    }
                }
                if (url.substring(url.length - 1, url.length) === '&')
                    url = url.substring(0, url.length - 1);
                if (url.substring(url.length - 1, url.length) === '?')
                    url = url.substring(0, url.length - 1);
            }
            return url;
        };
        //将search转换成json
        //noinspection JSUnusedGlobalSymbols
        String.prototype.searchToJson = function () {
            let search = this,
                json = {};
            search = search.indexOf('?') >= 0 ? search.substring(search.indexOf('?') + 1, search.length) : search;
            if (search.length > 0) {
                const searchArr = search.split('&');
                if (searchArr) {
                    for (let i = 0, len = searchArr.length; i < len; i++) {
                        const item = searchArr[i].split('=');
                        json[item[0]] = item[1];
                    }
                }
            }
            return json;
        };
        //将search转换成Array
        //noinspection JSUnusedGlobalSymbols
        String.prototype.searchToArray = function () {
            let search = this,
                arr = [];
            search = search.indexOf('?') >= 0 ? search.substring(search.indexOf('?') + 1, search.length) : search;
            if (search.length > 0) {
                const searchArr = search.split('&');
                if (searchArr) {
                    for (let i = 0, len = searchArr.length; i < len; i++) {
                        const item = searchArr[i].split('=');
                        arr.push({
                            key: item[0],
                            value: item[1]
                        });
                    }
                }
            }
            return arr;
        };

        return this;
    }

    prototypeObject() {
        //将object转换为string类型的search
        //noinspection JSUnusedGlobalSymbols

        // Object.prototype.objectToSearch = function () {
        //     let object = this,
        //         search = '';
        //     if (Array.isArray(object)) {
        //         for (let i = 0, len = object.length; i < len; i++) {
        //             search += object[i].key + '=' + object[i].value + '&';
        //         }
        //     } else {
        //         for (const item in object) {
        //             if (object.hasOwnProperty(item)) {
        //                 search += item + '=' + object[item] + '&';
        //             }
        //         }
        //     }
        //     if (search) search = search.substring(0, search.length - 1);
        //     return search;
        // };

        return this;
    }

    prototypeNumber() {
        Number.prototype.toAmount = function (subLength) {
            let number = this;
            number = number.toFixed(subLength + 1);
            return number.substring(0, number.length - 1);
        };

        return this;
    }

    //唯一编号
    static uniqueID() {
        return (+new Date() * 1e6 + Math.floor(Math.random() * 1e6)).toString(36);
    }

    objectToSearch(object) {
        let search = '';
        if (Array.isArray(object)) {
            for (let i = 0, len = object.length; i < len; i++) {
                search += object[i].key + '=' + object[i].value + '&';
            }
        } else {
            for (const item in object) {
                if (object.hasOwnProperty(item)) {
                    search += item + '=' + object[item] + '&';
                }
            }
        }
        if (search) search = search.substring(0, search.length - 1);
        return search;
    }
}

/**
 * http请求
 */
class Http {
    static getInstance() {
        if (!Http.instance) {
            Http.instance = new Http();
        }
        return Http.instance;
    };

    constructor() {
    }

    static get(url, data, success, err, isLoading) {
        this.httpRequest({
            method: 'GET',
            url: url,
            data: data,
            success: success,
            error: err,
            isLoading: isLoading
        });
    }


    static post(url, data, success, err, isLoading) {
        this.httpRequest({
            method: 'POST',
            url: url,
            data: data,
            success: success,
            error: err,
            isLoading: isLoading
        });
    }

    /**
     * 请求
     * @param params
     * method = GET
     * url
     * data
     * async = true
     * contentType
     * success
     * error
     * isLoading = false
     */
    static httpRequest(params) {
        if (typeof params !== "object") return console.error('params不是json');
        if (typeof Core === "undefined") return console.error('core未引用');
        let request, send = null,
            method = params.method || 'GET',
            url = params.url,
            data = params.data,
            async = params.async || true,
            contentType = params.contentType || 'application/json',
            success = params.success,
            error = params.error,
            isLoading = params.isLoading || false;
        const loadingBox = typeof LoadingBox === "undefined" ? undefined : LoadingBox.getInstance(),
            core = typeof Core === "undefined" ? undefined : Core.getInstance();

        if (!url) return console.error('url undefined');
        if (window.XMLHttpRequest) request = new XMLHttpRequest();
        if (window.ActiveXObject) request = new ActiveXObject('Microsoft.XMLHTTP');

        request.onreadystatechange = function () {
            const status = request.status,
                readyState = request.readyState;
            if (status === 404)
                return console.error(url + ' ' + method + ' 404');
            switch (readyState) {
                case 0://请求未初始化
                    break;
                case 1://服务器连接已建立
                    if (loadingBox && isLoading)
                        loadingBox.show();
                    break;
                case 2://请求已接收
                    break;
                case 3://请求处理中
                    break;
                case 4://请求已完成，且响应已就绪
                    if (loadingBox && isLoading)
                        loadingBox.hide();
                    if (status === 200) {
                        const responseText = request.responseText;
                        if (success) success(JSON.parse(responseText));
                    } else {
                        if (error) error();
                    }
                    break;
            }
        };

        if (method.toUpperCase() === 'GET') {
            //get
            url = url.replaceUrl(data);
            request.open(method, url, async);
        } else if (method.toUpperCase() === 'POST') {
            request.open(method, url, async);
            request.setRequestHeader('Content-Type', contentType + '; charset=utf-8');
            if (contentType.indexOf('application/json') >= 0) {
                //application/json
                send = JSON.stringify(data);
            } else if (contentType.indexOf('text/html') >= 0) {
                //text/html
            } else if (contentType.indexOf('x-www-form-urlencoded') >= 0) {
                //application/x-www-form-urlencoded
                send = core.objectToSearch(data);
            }
        } else {
            console.error('暂时不支持 get,post之外的请求');
        }
        request.send(send);
    }

}

class Api {
    static getInstance() {
        if (!Api.instance) {
            Api.instance = new Api();
        }
        return Api.instance;
    };

    constructor() {
        const _cmsHost = 'http://test.news.hlchub.org/',
            _hostBtc = 'https://test-insight.bitpay.com/',
            _hostHlc = 'http://test.wallet.hlchub.org/';

        //cms
        this.articleList = _cmsHost + 'api/v1/article/item/list?pre_page={count}&page={page}';
        this.articleDetail = _cmsHost + 'api/v1/article/item/{id}';

        //-- hlc
        this.getUtxoHlc = _hostHlc + 'api/v1/wallet/utxos?address={address}';
        this.sendtxHlc = _hostHlc + 'api/v1/tx/sendrawtx';

        //--btc
        this.getUtxoBtc = _hostBtc + 'api/txs?address={address}&pageNum=0';
        this.sendtxBtc = _hostBtc + 'api/tx/send';
        this.getAllByAddr = _hostBtc + 'api/addr/{address}/?noTxList=2';
    }
}

module.exports = Http;