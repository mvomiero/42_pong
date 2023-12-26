every time sendGameData is called and received on the other end, the players local variables will be updated
so the rule is we every time data changes we send it


Logic

game starts only when startGame button is clicked

paddle keys are up/down arrows
player 1 controls left paddle
player 2 controls right paddle
when key is pressed

sendGameData(): if player not 0, paddle and ball data are sent over the network with command "update":
- game starts
- each animation loop
- when any key is pressed down
- when any key is released

the gameSocket.onmessage function parses commands in the received json
possible commands:
	- "set_player": char_choice is the name the player chose
	- "match_info":
		"start"
			set player names
			set player scores to 0
			set player to 1 or 2 or 0, depending on if char_choice === player1/2 or not
			call startGame function
		"end"
			set ball velocities to 0
			init ball position
			// better with initBall function
		"update"
			update scores from network data
	- "tournament_info": don't care about this for now
	- "update"
		set paddle and ball variables to those received over network
	- "gamePause"
		set gamePaused variable to that received over the network

# keyboard events

Space Bar: toggles gamePaused state and calls sendGamePause()
Up arrow: leftPaddle.dy = -paddleSpeed;
Down arrow: leftPaddle.dy = paddleSpeed;

so if paddles are not moving:
- is player number set correctly? yes
- 