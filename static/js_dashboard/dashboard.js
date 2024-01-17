

/***************************************************/
/**************** INITIALATION DATA ****************/
/***************************************************/
fetchMatchDashboard();
fetchTournamentDashboard();
fetchPlayerDashboardList();


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
        console.log('dataTableSimple: ', dataTable);
    }
});

function initializeDataTable(playerList) {
    let i = 0;
    playerList.forEach(player => {
        var newRow = [player, `<a class="btn btn-vaporwave btn-choose" id="btnPlayerSelect" data-value="${player}">✔</a>`];

        dataTable.rows.add(newRow);
    });

    console.log('dataTableSimple: ', dataTable);
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
