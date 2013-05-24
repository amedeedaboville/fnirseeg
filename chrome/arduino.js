/* arduino.js
 * Handles connecting to the arduino and the arduino nav tab.
 * May 23 2013
 * Amedee d'Aboville
 */

var ab2str=function(buf) { /* Convert an ArrayBuffer to a String, using UTF-8 as the encoding scheme.*/
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};
var onCharRead=function(readInfo) {
    if (readInfo && readInfo.bytesRead>0 && readInfo.data) {
        var str=ab2str(readInfo.data);
        if (str[readInfo.bytesRead-1]==='\n') {
            dataRead+=str.substring(0, readInfo.bytesRead-1);
            console.log(dataRead);
            dataRead="";
        } else {
            dataRead+=str;
        }
    }
    chrome.serial.read(connectionId, 128, onCharRead);
}
var receiveArduino = function (connectionInfo) {
    console.log(connectionInfo);
    connectionId = connectionInfo.connectionId; 
    if (connectionId != -1)
    {
        var dataRead='';

        chrome.serial.read(connectionId, 128, onCharRead);

    }
}

var onGetPorts = function(ports) {
    var port = ports.filter(function (p) { 
        if(p == '/dev/ttyACM0' || p == '/dev/ttyACM1' || p == 'COM0' || p == 'COM1' || p == '/dev/ttyusb0') return true;
        else return false})[0];
    console.log(port);
    chrome.serial.open(port,{bitrate: 9600},receiveArduino);
}
chrome.serial.getPorts(onGetPorts);
