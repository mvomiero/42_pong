
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
        console.log('[Match] Data received from backend: ', data);
        
        // Update cards
        updateCardsMatch(data.cards);

        // Draw charts
        drawChart1(data.barChart1, 'chart1');
        drawLineChart(data.lineChart1, 'chart2');
        drawAreaChart(data.areaChart1, 'chart3');
        drawScatteredChart(data.scatteredChart1, 'chart4');

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
        console.log('[Tournament] Data received from backend: ', data);
        
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
        console.log('[Player] Data received from backend (player List): ', data);
        
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
        console.log('[playerDashboard] Data (individual) received from backend: ', data);
        
        initializePlayerCards(data.cards, playerAlias);
        drawPiePlayers(data.pieWin, 'chartPiePlayer1', [bs_success, bs_gray200], 'Wins of Player');
        drawPiePlayers(data.pieLoss, 'chartPiePlayer2', [bs_danger, bs_gray200], 'Losses of Player');
        // check if data.pieTournamentRank is empty
        if (Object.keys(data.pieTournamentRank).length === 0) {
            
        } else {
            drawPiePlayers(data.pieTournamentRank, 'chartPiePlayer3', [bs_success, bs_warning, bs_gray200], 'Tournaments of Player');
        }
        

      })
      .catch(error => {
        console.error('Fetch error:', error);
        // Handle errors here
      });
}