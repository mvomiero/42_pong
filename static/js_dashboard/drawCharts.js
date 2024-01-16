
/***************************************************/
/**************** GET CSS VARIABLES ****************/
/***************************************************/

const rootStyles = getComputedStyle(document.documentElement);
bs_primary = rootStyles.getPropertyValue('--bs-primary');
bs_secondary = rootStyles.getPropertyValue('--bs-secondary');
bs_white = rootStyles.getPropertyValue('--bs-white');
bs_darkGrey = rootStyles.getPropertyValue('--bs-gray-900');
bs_lightGrey = rootStyles.getPropertyValue('--bs-gray-750');
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
/* Chart.defaults.global.defaultFontColor = '#292b2c'; */


// Bar Chart Example
function drawChart1(chartData) {
    console.log('Data for chart:', chartData);

    // Extracting data for chart
    var labels = Object.keys(chartData);
    var data = Object.values(chartData);

    // Get the canvas element and create the chart
    var canvas = document.getElementById('chart1').getContext('2d');
    var horizontalBarChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Games',
                data: data,
                backgroundColor: bs_secondary
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Matches and Players per Day',
                    font: {
                        size: 24,
                        weight: 'bold'
                    },
                    color: bs_dark,
                    align: 'center',
                    position: 'top'
                },
                legend: {
                    display: false  // Hides the legend specifically for horizontal bar chart
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Games',
                        color: bs_darkGrey,
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    gridLines: {
                        display: true,
                        color: bs_lightGrey
                    },
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit: 7,
                        color: bs_darkGrey
                    }

                },
                y: {
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        color: bs_darkGrey
                    }
                }
            }
        }
    });
}

/* function drawChart2() {
    // Sample Data:
    var matchData = [
        { date: '01.12.2023', remoteMatch: [15, 42, 30, 8, 68], tournamentMatch: [23] },
        { date: '02.12.2023', remoteMatch: [], tournamentMatch: [10, 20, 15] },
        { date: '03.12.2023', remoteMatch: [35, 81, 16], tournamentMatch: [14, 29, 115, 21] },
        { date: '04.12.2023', remoteMatch: [54, 19], tournamentMatch: [] },
        { date: '05.12.2023', remoteMatch: [92, 43, 94, 44, 60, 31], tournamentMatch: [90, 14, 15] },
    ];

    // Convert data to a format compatible with Chart.js
    var scatterData = matchData.reduce((acc, curr) => {
        var date = curr.date;
        var remoteMatch = curr.remoteMatch.map(duration => ({ x: date, y: duration }));
        var tournamentMatch = curr.tournamentMatch.map(duration => ({ x: date, y: duration }));

        acc[0].data = acc[0].data.concat(remoteMatch);
        acc[1].data = acc[1].data.concat(tournamentMatch);

        return acc;
    }, [
        { label: 'Remote Matches', data: [], backgroundColor: 'rgba(255, 99, 132, 1)' },
        { label: 'Tournament Matches', data: [], backgroundColor: 'rgba(54, 162, 235, 1)' }
    ]);

    var canvas = document.getElementById('scatteredChart').getContext('2d');
    var scatteredChart = new Chart(canvas, {
        type: 'scatter',
        data: {
            datasets: scatterData
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // Customize additional options as needed
            plugins: {
                title: {
                    display: true,
                    text: 'Match Duration',// for remote and tournament matches',
                    font: {
                        size: 18,
                        color: '#333',
                        family: 'Arial'
                    },
                    align: 'center',
                    position: 'top'
                },
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'dd.mm.yyyy', // Format of your date'
                        // tooltipFormat: 'll', // Tooltip format
                        unit: 'day', // Adjust unit as needed
                        displayFormats: {
                            day: 'dd.mm.yyyy' // Display format for the x-axis
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Match Duration'
                    }
                }
            }
        }
    });
} */
