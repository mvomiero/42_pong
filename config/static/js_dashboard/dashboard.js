

/***************************************************/
/**************** INITIALATION DATA ****************/
/***************************************************/
let globalMatchData;
fetchMatchDashboard().then(data => {
    globalMatchData = data;
    createMatchDashboard();
});
let globalTournamentData;
fetchTournamentDashboard().then(data => {
    globalTournamentData = data;
});
fetchPlayerDashboardList();


/***************************************************/
/*************** CREATING DASHBOARD ****************/
/*************** MATCH / TOURNAMENT ****************/
/***************************************************/

function createMatchDashboard() {
    // Update cards
    updateCardsMatch(globalMatchData.cards);

    // Draw charts
    drawChart1(globalMatchData.barChart1, 'match-chart1', 'Matches per Day');
    drawLineChart(globalMatchData.lineChart1, 'match-chart2', 'Matches per Hour');
    drawAreaChart(globalMatchData.areaChart1, 'match-chart3', 'Accumulated Playing Time');
    drawScatteredChart(globalMatchData.scatteredChart1, globalMatchData.lineChart2, 'match-chart4', 'Match Duration (Average & Seperately)');
}

function createTournamentDashboard() {
    // Update cards
    updateCardsTournament(globalTournamentData.cards);

    // Draw charts
    drawChart1(globalTournamentData.barChart1, 'tournament-chart1', 'Tournaments per Day');
    drawLineChart(globalTournamentData.lineChart1, 'tournament-chart2', 'Tournaments per Hour');
    drawAreaChart(globalTournamentData.areaChart1, 'tournament-chart3', 'Accumulated Playing Time');
    drawScatteredChart(globalTournamentData.scatteredChart1, globalTournamentData.lineChart2, 'tournament-chart4', 'Tournament Duration (Average & Seperately)');

    // Draw table
    initDataTableTournament(globalTournamentData.allAndHash); // tournamentsHash
}


/***************************************************/
/********** TABLE INITIALATION / SETTINGS **********/
/************* (TOURNAMENT DASHBOARD) **************/
/***************************************************/

let dataTableTournament;

window.addEventListener('DOMContentLoaded', event => {
    const table = document.querySelector('#tournamentsHash');

    if (table) {
        dataTableTournament = new simpleDatatables.DataTable(table, {
            perPage: 5,             // Number of items per page
            perPageSelect: false,   // Hide the dropdown for selecting number of items per page
            searchable: false,       // Enable search field

            paging: true,           // Enable pagination
            firstLast: true,        // Show the 'first' and 'last' buttons
            truncatePager: true,    // Truncate the page links to prevent overflow with large datasets.
            pagerDelta: 1,          // Number of page links to display before and after the current page
        });
        console.log('dataTableTournament: ', dataTableTournament);
    }
});

function initDataTableTournament(tournamentList) {
    for (const [key, value] of Object.entries(tournamentList)) {
        console.log(`${key}: ${value}`);
        var newRow = [key, `<a class="btn btn-vaporwave btn-choose" href="https://ecosia.org" target="_blank">${value}</a>`];

        dataTableTournament.rows.add(newRow);
    }
    
}


/***************************************************/
/********** TABLE INITIALATION / SETTINGS **********/
/*********** (PLAYER SPECIFIC DASHBOARD) ***********/
/***************************************************/

let dataTable;

window.addEventListener('DOMContentLoaded', event => {
    const table = document.querySelector('#tablePlayers');

    if (table) {
        dataTable = new simpleDatatables.DataTable(table, {
            perPage: 5,             // Number of items per page
            perPageSelect: false,   // Hide the dropdown for selecting number of items per page
            searchable: true,       // Enable search field

            paging: true,           // Enable pagination
            firstLast: true,        // Show the 'first' and 'last' buttons
            truncatePager: true,    // Truncate the page links to prevent overflow with large datasets.
            pagerDelta: 1,          // Number of page links to display before and after the current page
        });
        // console.log('dataTableSimple: ', dataTable);
    }
});

function initializeDataTable(playerList) {
    let i = 0;
    playerList.forEach(player => {
        var newRow = [player, `<a class="btn btn-vaporwave btn-choose" id="btnPlayerSelect" data-value="${player}">✔</a>`];

        dataTable.rows.add(newRow);
    });

    // console.log('dataTableSimple: ', dataTable);
}


/***************************************************/
/************* CHOOSE PLAYER HANDLING **************/
/*********** (PLAYER SPECIFIC DASHBOARD) ***********/
/***************************************************/

// Button to go back to the player selection
document.getElementById('btnCloseDashboardPlayer').addEventListener('click', function () {
    document.getElementById('dashboardChoosePlayer').style.display = 'block';
    document.getElementById('dashboardPlayer').style.display = 'none';
});

function playerDashboard() {
    document.getElementById('dashboardChoosePlayer').style.display = 'none';
    document.getElementById('dashboardPlayer').style.display = 'block';
}

document.addEventListener('click', function (event) {
    if (event.target && event.target.id === 'btnPlayerSelect') {
        playerDashboard();
        fetchPlayerDashboard(event.target.getAttribute('data-value'));
    }
});
