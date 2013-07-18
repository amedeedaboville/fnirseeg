/*plot.js
 *Handles everything on the data tab. Plots data and handles visualizations.
 *May 23rd Amedee d'Aboville
 */
class Context() {

}

function drawHeatMap {


}
var numCharts = numVoxels;
var charts = Array();
for(i =0; i < numCharts; i++) {
    var chartdiv  =d3.select("body").append("div")
        .attr("id", "chart" + i);
    chartdiv.append("div").attr("class","heading").text("Sensor "+i);
    chartdiv.append("svg")
}
for(i = 0; i < numVoxels; i++) {
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
