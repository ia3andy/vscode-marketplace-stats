import '../app/js/script.js'
import $ from 'jquery'
import Highcharts from 'highcharts'

function toPoint(data) {
    return [
        new Date(data.time).getTime(),
        data.total_installed
    ];
}

var chart;
async function drawCharts (name) {
    //const series = fetchData();
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            //type: 'spline',
            zoomType: 'x',
            resetZoomButton: {
                position: {
                    align: 'left',
                    verticalAlign: 'top', // by default
                    x: 10,
                    y: 10
                },
                relativeTo: 'chart'
            },
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
        },
        title: {
            text: ''//'redhat.java installations'
        },
        xAxis: {
            type: 'datetime'//,
            //tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'Installs'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: await fetchData(name)
    });
}

async function fetchData(name) {
    var start = Date.now();
    var response = await fetch('/stats/' + name);
    var versions = JSON.parse(await response.text());
    var i = 0;
    var data = null;
    var point = null;
    var latest = null;
    var series = [];
    var startVersion = 0;
    var stopVersion = 0;
    var elapsedVersion = 0;
    for (var l = versions.length; i < l; i++) {
        startVersion = Date.now();
        var version = versions[i];
        data = [];
        for (var z = version.events.length, j = 0; j < z; j++) {
            point = toPoint(version.events[j]);
            data.push(point);
            if (latest == null || latest[0] < point[0]) {
                latest = point;
            }
        }
        var serie = {
            name: version._id,
            data: data
        }
        series.push(serie);
        stopVersion = Date.now();
        elapsedVersion = stopVersion - startVersion;
        //chart.redraw();
        console.log("Loaded " + serie.name + " in "+elapsedVersion+"ms");
    }
    if (latest !== null) {
        $("#value").html(format(latest[1])+" downloads");
    }
    var elapsed = new Date().getTime() - start;
    console.log("Loaded " + i + " data points in " + elapsed + "ms");
    return series;
}

function format(value) {
    return value.toLocaleString(
        undefined, // use a string like 'en-US' to override browser locale
    );
}

window.drawCharts = drawCharts;