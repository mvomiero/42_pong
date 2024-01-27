
/***************************************************/
/************* SET CARDS EQUAL HEIGHT **************/
/***************************************************/

// Select all the card elements
const cardElements = [
    document.getElementById('cardPlayerRegistrations'),
    document.getElementById('cardNbrMatches'),
    document.getElementById('cardTotalMatchTime'),
    document.getElementById('cardLongestMatch'),
    document.getElementById('cardBestPlayer'),
    document.getElementById('cardHeighestPlayingTime'),
];

// Function to find the maximum height among the cards
function getMaxHeight(cards) {
    let maxHeight = 0;
    cards.forEach(card => {
        const height = card.getBoundingClientRect().height;
        maxHeight = Math.max(maxHeight, height);
    });
    return maxHeight;
}

// Function to set the height for all cards
function setEqualHeight(cards, height) {
    cards.forEach(card => {
        card.style.height = `${height}px`;
        card.style.minHeight = `${height}px`;
    });
}

// Calculate the maximum height among the cards
const maxHeight = getMaxHeight(cardElements);

// Set the maximum height to all cards
setEqualHeight(cardElements, maxHeight);


/***************************************************/
/************** UPDATE VALUES MATCH ****************/
/***************************************************/
function updateCardsMatch(cardsData) {
    // console.log('Data for cards (Matches):', cardsData);

    const playerRegistrationsElement = document.getElementById('ma-playerRegistrations');
    playerRegistrationsElement.textContent = cardsData.uniquePlayers;

    const nbrMatchesElement = document.getElementById('ma-nbrPlayed');
    nbrMatchesElement.textContent = cardsData.nbrMatches;

    const totalMatchTimeElement = document.getElementById('ma-totalTime');
    totalMatchTimeElement.textContent = cardsData.totalMatchTime.hours.toString() + ' h ' + cardsData.totalMatchTime.minutes.toString() + ' min ' + cardsData.totalMatchTime.seconds.toString() + ' sec';

    const longestMatchTimeElement = document.getElementById('ma-longest');
    longestMatchTimeElement.textContent = cardsData.longestMatchTime.minutes.toString() + ' min ' + cardsData.longestMatchTime.seconds.toString() + ' sec';

    const bestPlayerAliasElement = document.getElementById('ma-bestPlayerAlias');
    bestPlayerAliasElement.textContent = cardsData.bestPlayer.alias;
    const bestPlayerWinsElement = document.getElementById('ma-bestPlayerWins');
    bestPlayerWinsElement.textContent = 'is the most successfull Player (won ' + cardsData.bestPlayer.wins.toString() + ' matches).';

    const highestPlayingTimeAliasElement = document.getElementById('ma-highestPlayingTimeAlias');
    highestPlayingTimeAliasElement.textContent = cardsData.bestPlayer.alias;
    const highestPlayingTimeElement = document.getElementById('ma-highestPlayingTimeTime');
    highestPlayingTimeElement.textContent = 'has the highest playing time (' + cardsData.highestTimePlayer.time.minutes.toString() + ' min ' + cardsData.highestTimePlayer.time.seconds.toString() + ' sec).';
}


/***************************************************/
/*********** UPDATE VALUES TOURNAMENTS *************/
/***************************************************/
function updateCardsTournament(cardsData) {
    // console.log('Data for cards (Tournaments):', cardsData);

    const playerRegistrationsElement = document.getElementById('tn-playerRegistrations');
    playerRegistrationsElement.textContent = cardsData.uniquePlayers;

    const nbrMatchesElement = document.getElementById('tn-nbrPlayed');
    nbrMatchesElement.textContent = cardsData.nbrMatches;

    const totalMatchTimeElement = document.getElementById('tn-totalTime');
    totalMatchTimeElement.textContent = cardsData.totalMatchTime.hours.toString() + ' h ' + cardsData.totalMatchTime.minutes.toString() + ' min ' + cardsData.totalMatchTime.seconds.toString() + ' sec';

    const longestMatchTimeElement = document.getElementById('tn-longest');
    longestMatchTimeElement.textContent = cardsData.longestMatchTime.minutes.toString() + ' min ' + cardsData.longestMatchTime.seconds.toString() + ' sec';

    const bestPlayerAliasElement = document.getElementById('tn-bestPlayerAlias');
    bestPlayerAliasElement.textContent = cardsData.bestPlayer.alias;
    const bestPlayerWinsElement = document.getElementById('tn-bestPlayerWins');
    bestPlayerWinsElement.textContent = 'is the most successfull Player (won ' + cardsData.bestPlayer.wins.toString() + ' tournaments).';

    const highestPlayingTimeAliasElement = document.getElementById('tn-highestPlayingTimeAlias');
    highestPlayingTimeAliasElement.textContent = cardsData.bestPlayer.alias;
    const highestPlayingTimeElement = document.getElementById('tn-highestPlayingTimeTime');
    highestPlayingTimeElement.textContent = 'has the highest playing time (' + cardsData.highestTimePlayer.time.minutes.toString() + ' min ' + cardsData.highestTimePlayer.time.seconds.toString() + ' sec).';
}
