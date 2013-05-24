var receiveArduino = function (connectionInfo) {
    console.log(connectionInfo);
    connectionId = connectionInfo.connectionId; 
    if (connectionId != -1)
    {
        var dataRead='';
        /* Convert an ArrayBuffer to a String, using UTF-8 as the encoding scheme.
         *    This is consistent with how Arduino sends characters by default */
        var ab2str=function(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        };

        var onCharRead=function(readInfo) {
            if (!connectionInfo) {
                return;
            }
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
function switchToList() {
    for(i = 0; i < numCharts;i++){
        var chart = $('#chart'+i);
        chart.attr("class","span11");
        chart.appendTo($('#sensors'));
        charts[i].update();
    }
    $('#sensors .row').remove();
}
function switchToSensors() {
    var numRows = Math.ceil(numCharts/4);
    for(i = 0; i < numRows;i++){
        $('#sensors').append('<div class="row" id=row'+i+'></div>')
            for(j = 0; j < 4; j++) {
                var chart = $('#chart'+Math.floor((numCharts/numRows*i+j)));
                chart.attr("class","span3");
                chart.appendTo($('#row'+i));
            }
    }
}

$('#toSensors').click(switchToSensors);
$('#toList').click(switchToList);

var numCharts = 8;
var charts = Array();
for(i =0; i < numCharts; i++) {
    var chartdiv  =d3.select("body").append("div")
        .attr("id", "chart" + i);
    chartdiv.append("div").attr("class","heading").text("Sensor "+i);
    chartdiv.append("svg")
}

function randomData(points) { //# groups,# points per group
    random = d3.random.normal();
    var d1 = [],
        d2 = [];
    for (j = 0; j < points; j++) {
        d1.push({x:j, y: random()});
        d2.push({x:j, y: random()});
    }
    return [
    {
        values: d1,
            key: 'HbO2',
            color: '#df0000',
    },{
        values: d2,
            key: 'Hb',
            color: '#3000ff',
    }];
}
for(i =0; i < numCharts; i++) {
    var chart;
    chart = nv.models.lineChart();
    chart.xAxis.tickFormat(d3.format('.02f'));
    chart.yAxis.tickFormat(d3.format('.02f'));

    d3.select('#chart' + i + ">svg")
        .datum(randomData(40))
        .transition().duration(500)
        .call(chart);
    nv.utils.windowResize(chart.update);
    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
    nv.render();
    charts.push(chart);
}
