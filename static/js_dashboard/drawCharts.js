
/***************************************************/
/**************** GET CSS VARIABLES ****************/
/***************************************************/

const rootStyles = getComputedStyle(document.documentElement);
bs_primary = rootStyles.getPropertyValue('--bs-primary');
bs_secondary = rootStyles.getPropertyValue('--bs-secondary');
bs_white = rootStyles.getPropertyValue('--bs-white');
bs_darkGray = rootStyles.getPropertyValue('--bs-gray-900');
bs_lightGray = rootStyles.getPropertyValue('--bs-gray-750');
bs_gray200 = rootStyles.getPropertyValue('--bs-gray-200');
bs_gray400 = rootStyles.getPropertyValue('--bs-gray-400');
bs_dark = rootStyles.getPropertyValue('--bs-dark');
bs_success = rootStyles.getPropertyValue('--bs-success');
bs_info = rootStyles.getPropertyValue('--bs-info');
bs_warning = rootStyles.getPropertyValue('--bs-warning');
bs_danger = rootStyles.getPropertyValue('--bs-danger');
bs_fontFamily = rootStyles.getPropertyValue('--bs-font-charts');


/***************************************************/
/************ GLOBAL VARIABLES CHARTS **************/
/***************************************************/
Chart.defaults.font.family = bs_fontFamily;


/***************************************************/
/*************** GENERIC SETTINGS ******************/
/***************************************************/
function createChartTitle(titleText) {
    return {
        display: true,
        text: titleText,
        font: {
            size: 24,
            weight: 'bold'
        },
        color: bs_dark,
        align: 'center',
        position: 'top'
    };
}

function createAxisTitle(titleText) {
    return {
        display: true,
        text: titleText,
        font: {
            size: 18,
            weight: 'bold'
        },
        color: bs_darkGray
    };
}

function createAxisGrid(displayBool) {
    return {
        display: displayBool,
        color: bs_gray200
    };
}

function createAxisTicks(maxTicksLimit) {
    if (maxTicksLimit > 0) {
        return {
            maxTicksLimit: maxTicksLimit,
            color: bs_darkGray
        };
    }
    else {
        return {
            color: bs_darkGray
        };
    }
}

function deleteOldChart(chartId) {
    var existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }
}

/***************************************************/
/***************** DRAWING CHARTS ******************/
/***************************************************/

// Horizontal Bar Chart
function drawChart1(chartData, chartId) {
    
    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        labels: Object.keys(chartData),
            datasets: [{
                label: 'Number of Games',
                data: Object.values(chartData),
                backgroundColor: bs_secondary
            }]
    };

    // define options for chart
    var options = {
        indexAxis: 'y',
        plugins: {
            title: createChartTitle('Matches and Players per Day'),
            legend: {
                display: false  // Hides the legend specifically for horizontal bar chart
            }
        },
        scales: {
            x: {
                title: createAxisTitle('Number of Games'),
                grid: createAxisGrid(true),
                ticks: createAxisTicks(8),
                beginAtZero: true,
            },
            y: {
                grid: createAxisGrid(false),
                ticks: createAxisTicks(-1),
            }
        },
        maintainAspectRatio: true,
        responsive: true,
    };

    // Get the canvas element and create the chart
    var canvas = document.getElementById(chartId).getContext('2d');
    var horizontalBarChart = new Chart(canvas, {
        type: 'bar',
        data: data,
        options: options
    });
}

function drawAreaChart(chartData, chartId) {

    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        labels: Object.keys(chartData),
        datasets: [{
            label: 'playing time',
            fill: true,
            data: Object.values(chartData),
            backgroundColor: bs_secondary,
            borderWidth: 0,
            pointBorderWidth: 1,
            pointBorderColor: bs_lightGray,
            pointBackgroundColor: bs_secondary,
            pointStyle: 'circle',
            tension: 0.3,
            hoverOffset: 4
        }]
    };

    // define options for chart
    var options = {
        plugins: {
            legend: {
                display: false
            },
            title: createChartTitle('Accumulated Match Time'),
        },
        scales: {
            x: {
                grid: createAxisGrid(true),
                ticks: createAxisTicks(20),
            },
            y: {
                title: createAxisTitle('Time (min)'),
                grid: createAxisGrid(true),
                ticks: createAxisTicks(-1),
                beginAtZero: true
            }
        },
        maintainAspectRatio: true,
        responsive: true,
    };

    // Get the canvas element and create the chart
    const ctx = document.getElementById(chartId).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });

}

function drawLineChart(chartData, chartId) {
    
    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        labels: Object.keys(chartData),
        datasets: [{
            label: 'nbr games',
            fill: false,
            data: Object.values(chartData),
            //backgroundColor: bs_secondary,
            borderColor: bs_secondary,
            //borderWidth: 2,
            pointBorderWidth: 1,
            pointBorderColor: bs_lightGray,
            pointBackgroundColor: bs_secondary,
            pointStyle: 'circle',
            tension: 0.1,
            /* hoverOffset: 4 */
        }]
    };

    // define options for chart
    var options = {
        plugins: {
            legend: {
                display: false
            },
            title: createChartTitle('Matches per Time of Day'),
        },
        scales: {
            x: {
                grid: createAxisGrid(true),
                ticks: createAxisTicks(-1),
            },
            y: {
                title: createAxisTitle('Number of Matches'),
                grid: createAxisGrid(true),
                ticks: createAxisTicks(-1),
                beginAtZero: true
            }
        },
        maintainAspectRatio: true,
        //responsive: false,
    };

    // Get the canvas element and create the chart
    const ctx = document.getElementById(chartId).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
    
}

function drawScatteredChart(chartData, chartId) {

    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        datasets: [{
          label: 'Scatter Dataset',
          data: chartData,
          /* data: [{
            x: -10,
            y: 0
          }, {
            x: 0,
            y: 9
          }, {
            x: 0,
            y: 10
          }, {
            x: 10,
            y: 5
          }, {
            x: 0.5,
            y: 5.5
          }], */
          backgroundColor: bs_secondary
        }],
        /* labels: Object.keys(chartData),
        datasets: {
            label: 'nbr games',
            fill: false,
            data: Object.values(chartData),
            //backgroundColor: bs_secondary,
            borderColor: bs_secondary,
            //borderWidth: 2,
            pointBorderWidth: 1,
            pointBorderColor: bs_lightGray,
            pointBackgroundColor: bs_secondary,
            pointStyle: 'circle',
            tension: 0.1,
            // hoverOffset: 4
        } */
    };

    // define options for chart
    var options = {
        plugins: {
            legend: {
                display: false
            },
            title: createChartTitle('Match Duration'),
        },
        scales: {
            /* xAxes: [{
                type: 'time',
                time: {
                  displayFormats: {
                     'millisecond': 'MMM DD',
                     'second': 'MMM DD',
                     'minute': 'MMM DD',
                     'hour': 'MMM DD',
                     'day': 'MMM DD',
                     'week': 'MMM DD',
                     'month': 'MMM DD',
                     'quarter': 'MMM DD',
                     'year': 'MMM DD',
                  }
                }
              }], */
            x: {
                grid: createAxisGrid(true),
                ticks: createAxisTicks(-1),
            },
            y: {
                title: createAxisTitle('time (sec)'),
                grid: createAxisGrid(true),
                ticks: createAxisTicks(-1),
                beginAtZero: true
            }
        },
        maintainAspectRatio: true,
        //responsive: false,
    };

    // Get the canvas element and create the chart
    const ctx = document.getElementById(chartId).getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: options
    });
    
}
