$(document).ready(function () {
chrome.serial.getPorts(onGetPorts);
$("#getPorts").click(function(e) {chrome.serial.getPorts(onGetPorts)});
});
