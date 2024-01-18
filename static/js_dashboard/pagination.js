// for Charts pagination
function paginationCharts(paginationId, chartId) {
    const paginationLinks = document.getElementById(paginationId).querySelectorAll('.page-link');

    // get length of paginationLinks
    const totalElements = paginationLinks.length;

    paginationLinks.forEach((link, index) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            // Hide all corresponding elements
            for (let i = 1; i <= totalElements; i++) {
                document.getElementById(`${chartId}${i}`).style.display = 'none';
            }

            // Show the clicked element
            document.getElementById(`${chartId}${index + 1}`).style.display = 'block';
        });
    });
}

// for Dashboard pagination
function paginationDashboard(paginationId) {
    const paginationLinks = document.getElementById(paginationId).querySelectorAll('.page-link');
    
    // get length of paginationLinks
    const totalElements = paginationLinks.length;

    paginationLinks.forEach((link, index) => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            // Retrieve the href value and targetElement from the clicked link
            const hrefValue = this.getAttribute('href').slice(1);    // Remove the leading '#'
            const targetElement = document.getElementById(hrefValue);
            
            // Show the element associated with the clicked link's href
            if (targetElement && hrefValue === 'dashboardMatch') {
                createMatchDashboard();
                document.getElementById('dashboardTournament').style.display = 'none';
                targetElement.style.display = "";
            }
            else if (targetElement && hrefValue === 'dashboardTournament') {
                createTournamentDashboard();
                document.getElementById('dashboardMatch').style.display = 'none';
                targetElement.style.display = "";
            }
        });
    });
}

// Initialize toggle functions
paginationCharts('pagChartsMatch', 'match-chart');
paginationCharts('pagChartsTournament', 'tournament-chart');
paginationDashboard('pagMatchTournament');