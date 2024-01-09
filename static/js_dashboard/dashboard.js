// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.font.family = 'Times New Roman';
/* Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c'; */

// Get computed color values from CSS variables
const rootStyles = getComputedStyle(document.documentElement);
bs_primary = rootStyles.getPropertyValue('--bs-primary');
bs_secondary = rootStyles.getPropertyValue('--bs-secondary');
bs_white = rootStyles.getPropertyValue('--bs-white');
bs_darkGrey = rootStyles.getPropertyValue('--bs-gray-900');
bs_lightGrey = rootStyles.getPropertyValue('--bs-gray-750');


// Fetch data from API
fetch('/dashboard', { method: 'GET', credentials: 'same-origin' }) // or specify 'same-origin' or 'include' for credentials
  .then(response => {
    if (!response.ok) {
      console.log('Network response was not ok');
      // throw new Error('Network response was not ok');
    }
    return response.json(); // assuming the backend responds with JSON data
  })
  .then(data => {
    // Process the retrieved data
    console.log('Data received from backend:', data);
    
    // Update cards
    updateCards(data.cards);

    // Draw charts
    drawChart1(data.chart1);
  })
  .catch(error => {
    console.error('Fetch error:', error);
    // Handle errors here
  });

function updateCards(cardsData) {
    console.log('Data for cards:', cardsData);

    const playerRegistrationsElement = document.getElementById('playerRegistrations');
    playerRegistrationsElement.textContent = cardsData.uniquePlayers;

    const nbrMatchesElement = document.getElementById('nbrMatches');
    nbrMatchesElement.textContent = cardsData.nbrMatches;

    const totalMatchTimeElement = document.getElementById('totalMatchTime');
    totalMatchTimeElement.textContent = cardsData.totalMatchTime.hours.toString() + ' h ' + cardsData.totalMatchTime.minutes.toString() + ' min ' + cardsData.totalMatchTime.seconds.toString() + ' sec';

    const longestMatchTimeElement = document.getElementById('longestMatch');
    longestMatchTimeElement.textContent = cardsData.longestMatchTime.minutes.toString() + ' min ' + cardsData.longestMatchTime.seconds.toString() + ' sec';

    const bestPlayerAliasElement = document.getElementById('bestPlayerAlias');
    bestPlayerAliasElement.textContent = cardsData.bestPlayer.alias;
    const bestPlayerWinsElement = document.getElementById('bestPlayerWins');
    bestPlayerWinsElement.textContent = 'is the most successfull Player (won ' + cardsData.bestPlayer.wins.toString() + ' matches).';

    const highestPlayingTimeAliasElement = document.getElementById('highestPlayingTimeAlias');
    highestPlayingTimeAliasElement.textContent = cardsData.bestPlayer.alias;
    const highestPlayingTimeElement = document.getElementById('highestPlayingTimeTime');
    highestPlayingTimeElement.textContent = 'has the highest playing time (' + cardsData.highestTimePlayer.time.minutes.toString() + ' min ' + cardsData.highestTimePlayer.time.seconds.toString() + ' sec).';
}

// Bar Chart Example
function drawChart1(chartData) {
    console.log('Data for chart:', chartData);

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
                label: 'Number of Games',
                data: data,
                backgroundColor: bs_secondary
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
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
                            /* family: 'Arial', */
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
}

//drawChart1();
drawChart2();
 */

function setEqualHeight() {
    var rows = $('.equal-height-row');
    rows.each(function () {
        var cards = $(this).find('.card');
        var maxCardHeight = 0;

        cards.each(function () {
            var cardHeight = $(this).outerHeight();
            if (cardHeight > maxCardHeight) {
                maxCardHeight = cardHeight;
            }
        });

        cards.outerHeight(maxCardHeight);
    });
}

// Call the function when the document is ready
$(document).ready(function () {
    setEqualHeight();

    // Optional: Recalculate heights on window resize
    $(window).on('resize', function () {
        setEqualHeight();
    });
});
