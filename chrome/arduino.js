/* arduino.js
 * Handles connecting to the arduino and the arduino nav tab.
 * May 23 2013
 * Amedee d'Aboville
 */
var ab2str=function(buf) { /* Convert an ArrayBuffer to a String, using UTF-8 as the encoding scheme.*/
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};
var port = "";
var onCharRead=function(readInfo) {
    if (readInfo && readInfo.bytesRead>0 && readInfo.data) {
        var str=ab2str(readInfo.data);
        if (str[readInfo.bytesRead-1]==='\n') {
            dataRead+=str.substring(0, readInfo.bytesRead-1);
            console.log(dataRead);
            parseIncomingLine(dataRead);
            return;
        } else {
            dataRead+=str;
        }
    }
    chrome.serial.read(connectionId, 128, onCharRead);
}
var onConnected = function (info) {
    console.log(info);
    if (info.connectionId != -1)
    {
        $("#connectionStatus").text("Connected to port "+port);
        var dataRead='';
        chrome.serial.read(info.connectionId, 128, onCharRead);
    }
    else {
        $("#connectionStatus").text("Connection to port "+port +" failed.");
    }
}
var connect = function(newPort) {
    port= newPort;
    console.log("connecting to port "+ newPort);
    $("#connectionStatus").text("Trying to connect to port "+port +".");
    chrome.serial.open(port,{bitrate: 9600},onConnected);
}
var onGetPorts = function(ports) {
    ports.map( function (p) { 
        var a =  $("#portsList").append('<li><a tabindex="-1" href="#" id="'+p+'">'+p+'</a></li>');
        $("a[id='"+p+"']").click(function(e) {
            connect(p);
            e.preventDefault();});
        console.log(a);
    });
    port = ports.filter(function (p) { 
        if(p == '/dev/ttyACM0' || p == '/dev/ttyACM1' || p == 'COM0' || p == 'COM1' || p == '/dev/ttyusb0') return true;
        else return false})[0];
    if(typeof port != 'undefined') {
        $("a[id='"+port+"']").click();
    }
}
