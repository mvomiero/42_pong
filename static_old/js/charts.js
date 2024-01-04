

function drawChart1() {
    // JSON data with static values
    var chartData = {
        "Monday": 10,
        "Tuesday": 15,
        "Wednesday": 20,
        "Thursday": 18,
        "Friday": 12,
        "Saturday": 27,
        "Sunday": 22
    };

    // Extracting data for chart
    var labels = Object.keys(chartData);
    var data = Object.values(chartData);

    // Get the canvas element and create the chart
    var canvas = document.getElementById('horizontalBarChart1').getContext('2d');
    var horizontalBarChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                axis: 'y',
                // label: 'Number of Games',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Matches and Players per day',
                    font: {
                        size: 18,
                        color: '#333',
                        family: 'Arial'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Games'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function drawChart2() {
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
}

function generateRandomData() {
    // Function to generate a random date within a specific range
    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    const startDate = new Date('2023-12-01');
    const endDate = new Date('2023-12-20');

    const data = [];
    var randomMatches = 0;

    while (startDate <= endDate) {
        randomMatches = randomMatches + Math.floor(Math.random() * 20); // Limit to 20 matches per day

        data.push({
            date: startDate.toISOString().slice(0, 10),
            matches: randomMatches
        });

        startDate.setDate(startDate.getDate() + 1);
    }

    return data;
}

function drawChart3() {
    const generatedData = generateRandomData();
    var dates = generatedData.map(entry => entry.date);
    var data = generatedData.map(entry => entry.matches);

    // // JSON data with static values
    // var dates = ["01.01.2023", "02.01.2023", "03.01.2023"];
    // var data = [2, 10, 11];

    const canvas = document.getElementById('areaChart').getContext('2d');
    const myChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Accumulated Matches',
                fill: true,
                data: data,
                backgroundColor: 'rgba(255, 127, 80, 0.7)',
                borderWidth: 0,
                pointBorderWidth: 1,
                pointBackgroundColor: 'rgba(255, 69, 0, 1)',
                pointStyle: 'rect',
                tension: 0.3
            }]
        },
        options: {
            // responsive: true,
            // maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Accumulated Matches per Day',
                    font: {
                        size: 18,
                        color: '#333',
                        family: 'Arial'
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Number of Matches'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function drawChart4() {
    // JSON data with static values
    var chartData = {
        "Monday": 2,
        "Tuesday": 16,
        "Wednesday": 20,
        "Thursday": 8,
        "Friday": 12,
        "Saturday": 26,
        "Sunday": 22
    };

    // Extracting data for chart
    var labels = Object.keys(chartData);
    var data = Object.values(chartData);

    // Get the canvas element and create the chart
    var canvas = document.getElementById('horizontalBarChart2').getContext('2d');
    var horizontalBarChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                axis: 'y',
                // label: 'Number of Games',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Players per day',
                    font: {
                        size: 18,
                        color: '#333',
                        family: 'Arial'
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Number of Games'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function drawChart5() {
    // JSON data with static values
    var chartData = [];
    for (var i = 0; i < 24; i++) {
        var hour = (i < 10 ? '0' : '') + i + ':00'; // Formatting the hour
        var randomValue = Math.floor(Math.random() * 31); // Random number between 0 and 30
        chartData.push({ hour: hour, value: randomValue });
    }

    // Extracting data for chart
    var labels = chartData.map(item => item.hour);
    var data = chartData.map(item => item.value);

    // Get the canvas element and create the chart
    var canvas = document.getElementById('barChart').getContext('2d');
    var barChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                axis: 'x',
                data: data,
                backgroundColor: 'rgba(154, 222, 35, 0.6)',
                borderColor: 'rgba(154, 222, 35, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'x',
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Players per day',
                    font: {
                        size: 18,
                        color: '#333',
                        family: 'Arial'
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Number of Players'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function setupPagination() {
    // Function to switch between chart sections based on pagination links
    document.querySelectorAll('.pagination a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetChart = this.getAttribute('href').substring(1);
            document.querySelectorAll('.chart-section').forEach(function(section) {
                if (section.id === targetChart) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
}

drawChart1();
drawChart2();
drawChart3();
drawChart4();
drawChart5();
setupPagination();