/* arduino.js
 * Handles connecting to the arduino and the arduino nav tab.
 * May 23 2013
 * Amedee d'Aboville
 */

// global variables. be careful
var numVoxels = 12;
var port = "";
var dataRead="";

function checkLine(data) {
  var vals = data.split(",");
  if(vals.length == 2*numVoxels + 1) {
    var sum = vals.reduce(function(a, b) {return a + parseInt(b)}, 0);
      if(sum == parseInt(vals[vals.length-1]) * 2)
        return true;
    console.log("dataline '"+data+"' sums to " + sum +".");
  }
  else{
    console.log("dataline '"+data+"' did not have " +(2*numVoxels +1)+" voxels, only " + vals.length);
  }
  return false;
}

function parseIncomingLine(dataLine) {
  if(checkLine(dataLine)){
    var vals = dataLine.split(",");
    if($(".messageElement").length >20) {
      $(".messageElement")[0].remove();
    }
    $("#recentArduino").append('<li class="messageElement"><a tabindex="-1">'+dataLine+'</a></li>');
  }
}

var ab2str=function(buf) { /* Convert an ArrayBuffer to a String, using UTF-8 as the encoding scheme.*/
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

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
    chrome.serial.getPorts(onGetPorts); //Rescan if the connection didn't work, device might have been physically disconnected.
  }
}

var connect = function(newPort) {
  port= newPort;
  console.log("connecting to port "+ newPort);
  $("#connectionStatus").text("Trying to connect to port "+port +".");
  chrome.serial.open(port,{bitrate: 115200},onConnected);
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
    if(p == '/dev/ttyACM0' || p == '/dev/ttyACM1' || p == 'COM0' || p == 'COM1' || p == '/dev/ttyusb0' || p == '/dev/tty.usbmodem1411') return true;
    else return false})[0];
  if(typeof port != 'undefined') {
    $("a[id='"+port+"']").click(); // We call click instead of connect directly so that the item is highlighted in the list.
  }
  else {
    window.setTimeout(function () { 
      chrome.serial.getPorts(onGetPorts); //If we didn't find an arduino, re scan the list in a bit
    }, 1000);
  }
}
