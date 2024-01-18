
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
bs_color = rootStyles.getPropertyValue('--btn-color');
bs_magenta = '#ff00ff';
bs_body_color = rootStyles.getPropertyValue('--bs-body-color');
bs_fontFamily = rootStyles.getPropertyValue('--bs-body-font-family');


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
            size: 30,
            weight: 'bold'
        },
        color: bs_magenta,
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
        color: bs_white
    };
}

function createAxisGrid(displayBool) {
    return {
        display: displayBool,
        color: bs_body_color
    };
}

function createAxisTicks(maxTicksLimit) {
    if (maxTicksLimit > 0) {
        return {
            maxTicksLimit: maxTicksLimit,
            color: bs_body_color
        };
    }
    else {
        return {
            color: bs_body_color
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
function drawChart1(chartData, chartId, titleText) {
    
    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        labels: Object.keys(chartData),
            datasets: [{
                label: 'Amount',
                data: Object.values(chartData),
                backgroundColor: bs_secondary
            }]
    };

    // define options for chart
    var options = {
        indexAxis: 'y',
        plugins: {
            title: createChartTitle(titleText),
            legend: {
                display: false  // Hides the legend specifically for horizontal bar chart
            }
        },
        scales: {
            x: {
                title: createAxisTitle('Number'),
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

function drawAreaChart(chartData, chartId, titleText) {

    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        labels: Object.keys(chartData),
        datasets: [{
            label: 'Playing Time',
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
            title: createChartTitle(titleText),
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

function drawLineChart(chartData, chartId, titleText) {
    
    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        labels: Object.keys(chartData),
        datasets: [{
            label: 'Amount',
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
            title: createChartTitle(titleText),
        },
        scales: {
            x: {
                grid: createAxisGrid(true),
                ticks: createAxisTicks(-1),
            },
            y: {
                title: createAxisTitle('Number'),
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

function drawScatteredChart(dataScattered, dataLine, chartId, titleText) {

    // Delete old chart if it exists
    deleteOldChart(chartId);

    // define data for chart
    var data = {
        datasets: [{
            type: 'line',
            label: 'avg duration',
            data: Object.values(dataLine),
            fill: false,
            //backgroundColor: bs_secondary,
            borderColor: bs_secondary,
            borderWidth: 1,
            pointBorderWidth: 1,
            pointBorderColor: bs_lightGray,
            pointBackgroundColor: bs_secondary,
            pointStyle: 'circle',
            tension: 0.1,
            // hoverOffset: 4
        }, {
            type: 'scatter',
            label: 'match duration',
            data: Object.values(dataScattered),
            fill: false,
            //backgroundColor: bs_secondary,
            borderColor: bs_secondary,
            borderWidth: 2,
            pointBorderWidth: 2,
            pointBorderColor: bs_secondary,
            pointBackgroundColor: bs_secondary,
            pointStyle: 'crossRot',
            tension: 0.1,
            // hoverOffset: 4
        }],
        labels: Object.keys(dataLine)
    };

    // define options for chart
    var options = {
        scales: {
            y: {
              beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: createChartTitle(titleText),
        },
        scales: {
            x: {
                grid: createAxisGrid(true),
                ticks: createAxisTicks(15),
            },
            y: {
                title: createAxisTitle('Time (sec)'),
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
    const mixedChart = new Chart(ctx, {
        data: data,
        options: options
    });

}
