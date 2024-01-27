

/***************************************************/
/************ DRAW PIE CHARTS (RIGHT) **************/
/***************************************************/
function drawPiePlayers(chartData, chartId, color, titleTxt) {

    // Delete old chart if it exists
    deleteOldChart(chartId);

    // return of no data
    if (Object.keys(chartData).length === 0) {
        return;
    }
    
    // define data for chart
    var data = {
        labels: Object.keys(chartData),
        datasets: [{
            label: 'Wins of Player',
            data: Object.values(chartData),
            backgroundColor: color,
            hoverOffset: 4
        }]
    };

    // define options for chart
    var options = {
        plugins: {
            title: {
                display: true,
                text: titleTxt,
                font: {
                    size: 20,
                    weight: 'bold'
                },
                color: bs_white,
                align: 'center',
                position: 'top'
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: bs_body_color,
                    boxWidth: 20,
                    padding: 20
                }
            },
        },
        maintainAspectRatio: false,
    };

    // Get the canvas element and create the chart
    var canvas = document.getElementById(chartId).getContext('2d');
    var pieChart = new Chart(canvas, {
        type: 'doughnut',
        data: data,
        options: options,
        responsive: true
    });

}


/***************************************************/
/************* UPDATE CARDS (CENTER) ***************/
/***************************************************/
function initializePlayerCards(cardsData, alias) {
    const playerWinsElement = document.getElementById('pl-wins');
    playerWinsElement.textContent = cardsData.nbrWins;

    const playerMatchesElement = document.getElementById('pl-matches');
    playerMatchesElement.textContent = cardsData.nbrMatches;

    const playerAvgScoreElement = document.getElementById('pl-avgScore');
    playerAvgScoreElement.textContent = Number.isInteger(cardsData.avgPoints) ? cardsData.avgPoints.toString() : cardsData.avgPoints.toFixed(2);
    
    const playerPerfectMatchesElement = document.getElementById('pl-perfectMatches');
    playerPerfectMatchesElement.textContent = cardsData.nbrPerfectMatches;

    const playerTournamentsElement = document.getElementById('pl-tournaments');
    playerTournamentsElement.textContent = cardsData.nbrTournaments;
    
    const playerAliasElement = document.getElementById('pl-alias');
    playerAliasElement.textContent = alias;
}
