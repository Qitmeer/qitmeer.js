const http = require('http')
const https = require('https')
const _url = require('url')


module.exports = {

}

function Get(url, data, success) {

}




const requestPromise = (url, method, data) => {
    if (typeof url !== 'string' || url.length <= 0) return
    if (typeof method === 'string' && method.length > 0) method = method.toUpperCase()

    if (data) {
        for (let item in data) {
            if (url.indexOf('{' + item + '}') >= 0) url = url.replace('{' + item + '}', data[item])
        }
        data = JSON.stringify(data)
    }

    const location = _url.parse(url)
    let _HTTP = http
    let port = location.port === undefined ? 80 : location.port
    if (url.indexOf('https://' >= 0)){
        
    }

}