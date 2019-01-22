const http = require('http');
const https = require('https');
const _url = require('url');


module.exports = {
    Get,
    Post
};

async function Get(url, data, success) {
    const result = await requestPromise(url, 'GET', data);
    if (typeof success !== 'function') return result;
    return success(result)
}

async function Post(url, data, success) {
    const result = await requestPromise(url, 'POST', data);
    if (typeof success !== 'function') return result;
    return success(result)
}


const requestPromise = (url, method, data) => {
    if (typeof url !== 'string' || url.length <= 0) return;
    if (typeof method === 'string' && method.length > 0) method = method.toUpperCase();

    if (data) {
        for (let item in data) {
            if (data.hasOwnProperty(item)) {
                if (url.indexOf('{' + item + '}') >= 0) url = url.replace('{' + item + '}', data[item])
            }
        }
        data = JSON.stringify(data)
    }

    const location = _url.parse(url);
    let _HTTP = http;
    let port = location.port === undefined ? 80 : location.port;
    if (url.indexOf('https://') >= 0) {
        port = 443;
        _HTTP = https
    }
    let _result = '';
    let options = {
        method: method,
        host: location.hostname,
        port: port,
        path: location.path
    };

    if (method === 'POST') {
        options['headers'] = {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(data, 'utf8')
        }
    } else if (method === 'GET') {
        options['headers'] = {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    return new Promise((resolve, reject) => {
        let req = _HTTP.request(options, (res) => {
            if (res.statusCode === 200) {
                res.on('data', (result) => {
                    _result += result
                })
            } else {
                console.log('请求返回：' + res.statusCode)
            }
            res.on('end', () => {
                console.log('响应结束');
                _result = JSON.parse(_result.toString());
                resolve(_result)
            })
        });
        req.on('error', (err) => {
            console.log(err)
        });
        req.write(data);
        req.end()
    })
};