/* arduino.js
 * Handles connecting to the arduino and the arduino nav tab.
 * May 23 2013
 * Amedee d'Aboville
 */
function parseIncomingLine(dataLine) {
    var vals = dataLine.split(",");
    if($(".messageElement").length >20) {
        $(".messageElement")[0].remove();
    }
    $("#recentArduino").append('<li class="messageElement"><a tabindex="-1">'+dataLine+'</a></li>');
    
}
var ab2str=function(buf) { /* Convert an ArrayBuffer to a String, using UTF-8 as the encoding scheme.*/
    return String.fromCharCode.apply(null, new Uint8Array(buf));
};
var port = "";
var dataRead="";
var onCharRead=function(readInfo) {
    if (readInfo && readInfo.data && readInfo.data.byteLength> 0) {
        var str=ab2str(readInfo.data);
        if (str[str.length-1]==='\n') {
            dataRead+=str.substring(0, readInfo.data.byteLength-2);
            parseIncomingLine(dataRead);
            dataRead="";
        } else {
            dataRead+=str;
        }
    }
    chrome.serial.read(connectionId, 128, onCharRead);
}
var onConnected = function (info) {
    console.log(info);
    connectionId=info.connectionId;
    if (connectionId != -1)
    {
        $("#connectionStatus").text("Connected to port "+port);
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
var fillPortList = function(ports) {
    console.log("filling port list.");
    ports.map(function (p) { 
        var a =  $("#portList").append('<li><a href="#" tabindex="-1" id="'+p+'" class="portElement">'+p+'</a></li>');
        $("a[id='"+p+"']").click(function(e) {
            connect(p);
            e.preventDefault();});
    });
    $(".portElement").fadeIn(500);
}
var onGetPorts = function(ports) {
    console.log("Ports acquired.");
    $("#portList").empty();
    fillPortList(ports);
    port = ports.filter(function (p) { 
        if(p == '/dev/ttyACM0' || p == '/dev/ttyACM1' || p == 'COM0' || p == 'COM1' || p == '/dev/ttyusb0') return true;
        else return false})[0];
    if(typeof port != 'undefined') {
        $("a[id='"+port+"']").click();
    }
}
