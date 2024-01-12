
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
