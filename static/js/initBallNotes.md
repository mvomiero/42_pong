When the ball passes the left end of the table
    player 1 sends a ball reset
When the ball passses the right end of the table
    player 2 sends a ball reset

Issue: both players are sending game data on each animation loop
Solution 1:
    only player1 ever sends game data

Solution 2: 
    player 1 sends game data when ball is in their half of the table
    player 2 sends game data when ball is in their half of the table



Issue: when the ball goes past paddle, the ball should be reset to the centre, but as direction is randomised, the position is different for each player.
dx and dy are already synced on each animation loop
but visually we are switching between p1 and p2 values
not sure how this is even possible, as one message should be sent, both machines should receive it and their values should be set to these

sendMatchInfo
 could send initial ball X direction and initial ball Y direction


// APPROACH
only the player whose paddle who has been passed should send the score update
this update should contain the randomly generated ball X and Y directions
these will be received by both players and updated