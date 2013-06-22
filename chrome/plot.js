/*plot.js
 *Handles everything on the data tab. Plots data and handles visualizations.
 *May 23rd Amedee d'Aboville
 */
function switchToList() {
    for(i = 0; i < numCharts;i++){
        var chart = $('#chart'+i);
        chart.attr("class","span11");
        chart.appendTo($('#sensors'));
        charts[i].update();
    }
    $('#sensors .row').remove();
}
function drawHeatMap 
$('#toSensors').click(drawHeatMap);
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
