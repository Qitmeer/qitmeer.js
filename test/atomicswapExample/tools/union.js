function DectoHex(dec){
   
    var C = 0xF;   
    var A = dec;   
    var B = -1;  
    var S = '';    
    var hex = '0x'; 
    do {
        ++B;  
        A&=C;

        switch(A) {
            case 0xA:
                A='A';
                break;
            case 0xB:
                A='B';
                break;
            case 0xC:
                A='C';
                break;
            case 0xD:
                A='D';
                break;
            case 0xE:
                A='E';
                break;
            case 0xF:
                A='F';
                break;
                A=(A);
        }
        S+=A;       
        dec>>>=0x04;  
        A=dec;
    } while(dec);

    do {
        hex+=S[B];
        
    } while (B--);

    S = B = A = C = dec; 
    
    return hex;
}

const numToByteArray = function(num) {
    if (num <= 256) { 
        return [num];
    } else {
        return [num % 256].concat(numToByteArray(Math.floor(num / 256)));
    }
}

const bytesToNum = function(bytes) {
    if (bytes.length == 0) return 0;
    else return bytes[0] + 256 * bytesToNum(bytes.slice(1));
}


const hexToTime = hex => bytesToNum(hex.match(/(..)/g).map( v => parseInt( v,16 ) ))
const timeToHex = num => numToByteArray(num).map( v => DectoHex(v).substring(2)).join('')

module.exports = { hexToTime, timeToHex }
