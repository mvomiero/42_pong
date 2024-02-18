Changes I made:

# There are currently only four possible keyboard event messages sent from the front end: `player1PaddleUpKeyPressed`, `player2PaddleUpKeyPressed`, `player1PaddleDownKeyPressed` and `player1PaddleDownKeyPressed`. Currently I don't handle key releases, so there is no need hold state with "true/false". I'll think about this again when the rest works.
# [Flo] I think the event messages 'paddleUpKeyPressed' & 'paddleDownKeyPressed' are enough, because:
    * if first client (lets say Player1) sends a message, the corresponding PongConsumer instance of Player1 (lets call it pongConsumer1) receives it - so only one pongConsumer receives it and not the whole group
    * the match (stored in set_matches) is "public" and can be accessed by all instances of PongConsumer. When creating a new match, two instances of the class Paddle are created and stored in the global dict set_matches
    * each instance stores one of the paddles: e.g. pongConsumer1 stores the match.leftPaddle in self.paddle
    * when pongConsumer1 receive the message 'paddleUpKeyPressed' or 'paddleDownKeyPressed', it updates the self.paddle
    * both players can access the match-data (paddles and ball) via the set_matches, but will only update their corresponding paddle

# I removed need for ball speed or paddle speed throughout the code. Eventually paddle speed will affect ball speed as before, but will also add this back in later once the rest works.

# I changed any references to `leftPaddle` and `rightPaddle` to `player1Paddle` and `player2Paddle`, which makes more conceptual sense to me now, given that a paddle is just a attribute of a player

# I moved code from the frontend to update_ball that calculates the ball z based on ball x so that it reaches max_z when crossing the net and 0 at either paddle

# I removed all references to `sceneProperties.currentScene` i.e. `== game`. It seems to me that as the animation loop doesn't exist in the front end anymore, there will be not need for this conditional variable
# [Flo] We should discuss, if we still need the 'match_info' messages -> maybe it's good to keep them in for debugging, but can't think of use-case where we need it in the frontend

# I changed the way the score text is updated in the front end, now when received score data differs from existing score data, we update it (player1Score and player2Score) and trash and remake the score meshes. player1Score and player2Score are initially set and so initial meshes render as 0-0
# [Flo] Maybe it's good to split the data that we need for the actual display of the match and the information like the score and state of the match. We could have the following two commands:
    * 'match_info' -> as it is right now with the 'start', 'update' and 'end' and this would be the message to update the score
    * 'match_data' -> this could contain the key-hooks from the frontend and the ball/paddle/etc. data that we send from the backend to the frontend

# When reinitialising the ball once a point is scored, we now just set it to the new position sent by the backend, instead of removing the whole mesh and recreating it

Open questions:

# how do we handle the fact that we only (seem) to have access to self.paddle not player1.paddle and player2.paddle
if received_data['command'] == "player1PaddleUpKeyPressed":
    self.paddle.paddle_up()
elif received_data['command'] == "player2PaddleUpKeyPressed":
    self.paddle.paddle_down()
elif received_data['command'] == "player1PaddleDownKeyPressed":
    # ???
elif received_data['command'] == "player1PaddleDownKeyPressed":
    # ???
# what should the initial ball size be in the backend?
# how do we handle scaling of the ball and paddle data to the actual on-screen coordinates
# when we do we destroy all the graphical elements? In response to an "end" message from backend? removeElements function in frontend exists but is currently not called
# how do we scale the ball x, y, z and paddle y data to the correct canvas size in the front end?

- In the back end, x, y and z are just floats in the range 0. to 1. and don't know anything about front end canvas size
- In the front end, these floats need to be scaled to appear on the given canvas, the dimensions of which may change depending of how the browser window is resized
- Already in the front end code I am, establishing a zoom factor (0.027), then we multiplying the canvas width and height by this factor (`zoomedCanvasWidth` and `zoomedCanvasHeight`). I am also establishing some for the - sizes relative to the canvas

paddleWidth = sceneProperties.zoomedCanvasWidth * 0.02;
paddleHeight = sceneProperties.zoomedCanvasWidth * 0.2;
paddleDepth = sceneProperties.zoomedCanvasHeight * 0.05;
minBallZ = sceneProperties.zoomedCanvasWidth * 0.05;
maxBallZ = sceneProperties.zoomedCanvasWidth * 0.075;

It seems to me that
- ball x and y 0. to 1. will need to scale to zoomedCanvasWidth and zoomedCanvasHeight
- ball z 0. to 1. will need to scale to minBallZ and maxBallZ
- paddle y will need to scale to zoomedCanvasHeight

Notes to self:

# I now send the ball, paddle and score data bundle together as `match_data`, like we used to. I realised it makes more sense this way, as messages can never be received out of order, and I think general load is reduced. Also, `match_data` is only sent in the game update loop, not in direct response to keypress messages. So for example when a `player1PaddleDownKeyPressed` message is sent from the front end, a new `player1Paddle.y` will be calculated in the backend, but it will only actually be sent as part of the next bundle of `match_data` in the game update loop.
# [Flo] as you mention, I think the best is if we have a normed match rendered in the backend (e.g. most between 0..1) and scale it in the frontend. The ball size would therefore be set in the backend as well as the paddle sizes and the frontend would make it bigger/smaller if the screen is bigger/smaller. We can also think of sending a message with 'match_data' and the mode 'init_elements' to send from the backend to the frontend the intial size. This would give us the chance to easily change the sizes in the backend. But it also might not be necessary at all...