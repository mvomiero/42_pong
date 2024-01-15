/***************************************************/
/**************** GET CSS VARIABLES ****************/
/***************************************************/

/* const rootStyles = getComputedStyle(document.documentElement);
bs_primary = rootStyles.getPropertyValue('--bs-primary');
bs_secondary = rootStyles.getPropertyValue('--bs-secondary');
bs_white = rootStyles.getPropertyValue('--bs-white');
bs_darkGrey = rootStyles.getPropertyValue('--bs-gray-900');
bs_lightGrey = rootStyles.getPropertyValue('--bs-gray-750');
bs_dark = rootStyles.getPropertyValue('--bs-dark');
bs_success = rootStyles.getPropertyValue('--bs-success');
bs_info = rootStyles.getPropertyValue('--bs-info');
bs_warning = rootStyles.getPropertyValue('--bs-warning');
bs_danger = rootStyles.getPropertyValue('--bs-danger');
bs_fontFamily = rootStyles.getPropertyValue('--bs-font-charts'); */


/***************************************************/
/************ DRAW PIE CHARTS (RIGHT) **************/
/***************************************************/
function drawPiePlayers(chartData){//, chartId, color) {
    // Extracting data for chart
    var labels = Object.keys(chartData);
    var data = Object.values(chartData);

    // Get the canvas element and create the chart
    var canvas = document.getElementById('chartPiePlayer1').getContext('2d');
    console.log('Canvas Pie Chart:', canvas);
    var pieChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Games',
                data: data,
                backgroundColor: [bs_primary, bs_secondary, bs_success, bs_info, bs_warning, bs_danger]
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Players per Game',
                    font: {
                        size: 24,
                        weight: 'bold'
                    },
                    color: bs_dark,
                    align: 'center',
                    position: 'top'
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: bs_dark,
                        boxWidth: 20,
                        padding: 20
                    }
                }
            }
        }
    });
}

/***************************************************/
/************* UPDATE CARDS (CENTER) ***************/
/***************************************************/
function initializePlayerCards(cardsData) {
    const playerWinsElement = document.getElementById('pl-wins');
    playerWinsElement.textContent = cardsData.nbrWins;

    const playerMatchesElement = document.getElementById('pl-matches');
    playerMatchesElement.textContent = cardsData.nbrMatches;

    const playerAvgScoreElement = document.getElementById('pl-avgScore');
    playerAvgScoreElement.textContent = Number.isInteger(cardsData.avgPoints) ? cardsData.avgPoints.toString() : cardsData.avgPoints.toFixed(2);
    
    const playerperfectMatchesElement = document.getElementById('pl-perfectMatches');
    playerperfectMatchesElement.textContent = cardsData.nbrPerfectMatches;
}
