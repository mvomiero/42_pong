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

/* 
// Get the chart canvas elements
const chartCanvas1 = document.getElementById('chartPiePlayer1');
const chartCanvas2 = document.getElementById('chartPiePlayer2');
const chartCanvas3 = document.getElementById('chartPiePlayer3');

// Initial data for both charts
const data1 = {
    labels: ["HTML", "React", "Java", "Python", "JavaScript"],
    datasets: [{
        data: [20, 30, 15, 10, 25],
        backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384", "#4CAF50", "#9C27B0"]
    }]
};

const data2 = {
    labels: ["Category A", "Category B", "Category C"],
    datasets: [{
        data: [40, 30, 30],
        backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384"]
    }]
};

const data3 = {
    labels: ["Category A", "Category B", "Category C"],
    datasets: [{
        data: [40, 30, 30],
        backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384"]
    }]
};

let options = {
    plugins: {
        legend: true,
        textInside: {
            text: "Initial Text",
            color: bs_dark,
            fontSize: 28
        }
    }
};

Chart.register({
    id: 'textInside',
    afterDatasetsDraw: function (chart, _) {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        //const fontSize = options.plugins.textInside.fontSize;
        const fontSize = chart.options.plugins.textInside.fontSize;
        ctx.font = fontSize + 'px Arial';
        //ctx.fillStyle = options.plugins.textInside.color;
        ctx.fillStyle = chart.options.plugins.textInside.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        //const text = options.plugins.textInside.text;
        const text = chart.options.plugins.textInside.text;
        const textX = Math.round(width / 2);
        const textY = Math.round(height / 2);
        ctx.fillText(text, textX, textY);
    }
});

// Create the initial charts
const chart1 = new Chart(chartCanvas1, {
    type: 'doughnut',
    data: data1,
    options: options,
    responsive: true
});

const chart2 = new Chart(chartCanvas2, {
    type: 'doughnut',
    data: data2,
    options: options,
    responsive: true
});

const chart3 = new Chart(chartCanvas3, {
    type: 'doughnut',
    data: data3,
    options: options,
    responsive: true
});
 */

/***************************************************/
/************ DRAW PIE CHARTS (RIGHT) **************/
/***************************************************/
function drawPiePlayers(chartData, chartId, color, titleTxt) {

    // Delete old chart if it exists
    var existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
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
    let options = {
        plugins: {
            title: {
                display: true,
                text: titleTxt,
                font: {
                    size: 20,
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
