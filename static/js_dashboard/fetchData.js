
// Extract CSRF token from the HTML
const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;


/***************************************************/
/************* DASHBOARD FOR MATCHES ***************/
/***************************************************/

function fetchMatchDashboard() {
    fetch('/dashboardMatches', { method: 'GET', credentials: 'same-origin' }) // or specify 'same-origin' or 'include' for credentials
      .then(response => {
        if (!response.ok) {
          console.log('Network response was not ok');
          // throw new Error('Network response was not ok');
        }
        return response.json(); // assuming the backend responds with JSON data
      })
      .then(data => {
        // Process the retrieved data
        console.log('Data received from backend: ', data);
        
        // Update cards
        updateCardsMatch(data.cards);

        // Draw charts
        drawChart1(data.chart1);

      })
      .catch(error => {
        console.error('Fetch error:', error);
        // Handle errors here
      });
}

/***************************************************/
/*********** DASHBOARD FOR TOURNAMENTS *************/
/***************************************************/

function fetchTournamentDashboard() {
    fetch('/dashboardTournaments', { method: 'GET', credentials: 'same-origin' }) // or specify 'same-origin' or 'include' for credentials
      .then(response => {
        if (!response.ok) {
          console.log('Network response was not ok');
          // throw new Error('Network response was not ok');
        }
        return response.json(); // assuming the backend responds with JSON data
      })
      .then(data => {
        // Process the retrieved data
        console.log('Data received from backend: ', data);
        
        // Update cards
        updateCardsTournament(data.cards);

        // Draw charts
        //drawChart1(data.chart1);

      })
      .catch(error => {
        console.error('Fetch error:', error);
        // Handle errors here
      });
}


/***************************************************/
/********** PLAYER INDIVIDUAL DASHBOARD ************/
/***************************************************/

function fetchPlayerDashboardList() {
    fetch('/dashboardPlayerList', { method: 'GET', credentials: 'same-origin' }) // or specify 'same-origin' or 'include' for credentials
      .then(response => {
        if (!response.ok) {
          console.log('Network response was not ok');
          // throw new Error('Network response was not ok');
        }
        return response.json(); // assuming the backend responds with JSON data
      })
      .then(data => {
        // Process the retrieved data
        console.log('Data received from backend (player List): ', data);
        
        // Initialize DataTable
        initializeDataTable(data.playerList);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        // Handle errors here
      });
}

// fetch data from post request and sending post request
function fetchPlayerDashboard(playerAlias) {
    fetch('/dashboardPlayer/', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken  // Include the CSRF token here
        },
        body: JSON.stringify({ playerAlias: playerAlias })
    })
      .then(response => {
        if (!response.ok) {
          console.log('Network response was not ok');
          // throw new Error('Network response was not ok');
        }
        return response.json(); // assuming the backend responds with JSON data
      })
      .then(data => {
        // Process the retrieved data
        console.log('[playerDashboard] Data received from backend: ', data);
        
        initializePlayerCards(data.cards, playerAlias);
        drawPiePlayers(data.pieWin, 'chartPiePlayer1', [bs_success, bs_gray200], 'Wins of Player');
        drawPiePlayers(data.pieLoss, 'chartPiePlayer2', [bs_danger, bs_gray200], 'Losses of Player');
        drawPiePlayers(data.pieTournamentRank, 'chartPiePlayer3', [bs_success, bs_warning, bs_gray200], 'Tournaments of Player');

        /* drawPiePlayers(chart1, Object.keys(data.pieWin), Object.values(data.pieWin), [bs_success, bs_gray200], '45 %')
        drawPiePlayers(chart2, Object.keys(data.pieLoss), Object.values(data.pieLoss), [bs_success, bs_gray200], '40 %')
        drawPiePlayers(chart3, Object.keys(data.pieTournamentRank), Object.values(data.pieTournamentRank), [bs_success, bs_warning, bs_gray200], '65 %') */
      })
      .catch(error => {
        console.error('Fetch error:', error);
        // Handle errors here
      });
}