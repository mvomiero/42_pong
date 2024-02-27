
import random, math
import asyncio
import time

class Table:
    def __init__(self):
        self.width = 1
        self.height = 1
        self.depth = 0.1
        self.left = -0.5
        self.right = 0.5
        self.top = 0.5
        self.bottom = -0.5

class Ball:
    def __init__(self):
        self.size = 0.1
        self.x = 0
        self.y = 0
        self.z = 1
        self.dx = 1 if random.random() < 0.5 else -1
        self.dy = random.uniform(-1, 1)
        self.speed = random.uniform(0.003, 0.0037)
        self.min_speed = 0.0025
        self.max_speed = 0.06
        self.decrease_speed_multiplier = 0.7
        self.increase_speed_multiplier = 0.065
        self.min_z = self.size
        self.max_z = self.randomise_max_z()
    
    def randomise_max_z(self):
        # between min of ball.size and max of a random value between ball.size and 1
        return random.uniform(self.size, 1)

    def update_position(self):
        self.x += self.dx * self.speed
        self.y += self.dy * self.speed
        # calculate ball z based on ball x so that it reaches max_z when crossing the net and 0 at either paddle
        # where '0' is mean and 1/4 is standard_deviation
        self.z = self.size / 2 + self.max_z * math.exp(-((self.x - 0) ** 2) / (2 * (1/4) ** 2))

    def check_hit_table_top_or_bottom(self, table):
        if self.y < table.bottom or self.y >= table.top:
            self.dy = -self.dy

    def check_hit_paddle(self, paddle):
        bottom_of_paddle = paddle.y - paddle.half_height
        top_of_paddle = paddle.y + paddle.half_height
        if bottom_of_paddle < self.y < top_of_paddle:
            self.x = paddle.x
            self.dx = -self.dx
            self.max_z = self.randomise_max_z()
            if paddle.speed == 0:
                self.speed *= self.decrease_speed_multiplier
            else:
                self.speed += paddle.speed * self.increase_speed_multiplier
            if self.speed < self.min_speed:
                self.speed = self.min_speed
            if self.speed > self.max_speed:
                self.speed = self.max_speed
            return True
        else:
            return False

class Paddle:
    def __init__(self, init_x):
        self.x = init_x
        self.y = 0
        self.height = 1/4
        self.half_height = self.height / 2
        self.speed = 0
        self.speed_init = 0.001
        self.speed_increment = 0.0005
        self.min_speed = 0.001
        self.max_speed = 0.04
        self.up_key_held = False
        self.down_key_held = False
    
    def paddle_keyPress(self, direction, action):
        if direction == 'up' and action == 'pressed':
            self.paddle_up_pressed()
        elif direction == 'up' and action == 'released':
            self.paddle_up_released()
        elif direction == 'down' and action == 'pressed':
            self.paddle_down_pressed()
        elif direction == 'down' and action == 'released':
            self.paddle_down_released()

    def paddle_up_pressed(self):
        if not self.up_key_held:
            self.down_key_held = False
            self.up_key_held = True
            self.speed = self.speed_init

    def paddle_up_released(self):
        self.up_key_held = False
        self.speed = 0

    def paddle_down_pressed(self):
        if not self.down_key_held:
            self.up_key_held = False
            self.down_key_held = True
            self.speed = self.speed_init

    def paddle_down_released(self):
        self.down_key_held = False
        self.speed = 0
    
    def update_paddle(self, table_top, table_bottom):
        if self.up_key_held:
            if self.y + self.half_height < table_top:
                self.speed += self.speed_increment
                self.y += self.speed
            else:
                self.y = table_top - self.half_height
                self.speed = 0
        if self.down_key_held:
            if self.y - self.half_height > table_bottom:
                self.speed += self.speed_increment
                self.y -= self.speed
            else:
                self.y = table_bottom + self.half_height
                self.speed = 0
  
class Match():
    winning_score = 11

    def __init__(self, tournament):
        self.consumer_instances = []
        self.player1_name = None
        self.player2_name = None
        self.table = Table()
        self.ball = Ball()
        self.paddle_left = Paddle(self.table.left)
        self.paddle_right = Paddle(self.table.right)
        self.score_player1 = 0
        self.score_player2 = 0
        self.start_time = None
        self.end_time = None
        self.tournament = tournament
        self.paused = False
        self.paused_consumer = None
        self.player_quit = False
        self.finished = False
        self.group_name = None
        self.lock = asyncio.Lock()
    
    def clear_match(self):
        self.consumer_instances = []
        self.table = None
        self.ball = None
        self.paddle_left = None
        self.paddle_right = None
        self.tournament = None
        self.player1_name = None
        self.player2_name = None
        self.group_name = None

    def set_start_time(self):
        self.start_time = time.time()
    
    def set_end_time(self):
        self.end_time = time.time()

    def player_missing(self):
        return self.player1_name is None or self.player2_name is None

    def add_player(self, player_name, player_instance):
        if self.player1_name is None:
            self.player1_name = player_name
        else:
            self.player2_name = player_name
        self.consumer_instances.append(player_instance)

    def get_paddle(self, player_name):
        if self.player1_name == player_name:
            return self.paddle_left
        elif self.player2_name == player_name:
            return self.paddle_right
        else:
            return None
    
    def get_finalRank(self):
        if self.score_player1 < self.winning_score and self.score_player2 < self.winning_score:
            return []
        if self.score_player1 > self.score_player2:
            return [self.player1_name, self.player2_name]
        else:
            return [self.player2_name, self.player1_name]
    
    def get_winner(self):
        if self.score_player1 < self.winning_score and self.score_player2 < self.winning_score:
            return None
        if self.score_player1 > self.score_player2:
            return self.player1_name
        else:
            return self.player2_name
    
    def get_winner_instance(self):
        if self.score_player1 < self.winning_score and self.score_player2 < self.winning_score:
            return None
        if self.score_player1 > self.score_player2:
            return self.consumer_instances[0]
        else:
            return self.consumer_instances[1]

    def pause_start(self, player_instance):
        if not self.paused and player_instance in self.consumer_instances:
            self.paused = True
            self.paused_consumer = player_instance
    
    def pause_end(self, player_instance):
        if self.paused_consumer == player_instance:
            self.paused = False
            self.paused_consumer = None

    def check_if_ball_hit_paddle(self):
        if self.ball.x < self.paddle_left.x:
            hit_paddle_left = self.ball.check_hit_paddle(self.paddle_left)
            if not hit_paddle_left:
                self.score_player2 += 1
                self.ball = Ball()
                return False
        elif self.ball.x > self.paddle_right.x:
            hit_paddle_right = self.ball.check_hit_paddle(self.paddle_right)
            if not hit_paddle_right:
                self.score_player1 += 1
                del self.ball
                self.ball = Ball()
                return False
        return True
    
    def update_ball(self):
        if not self.paused:
            self.ball.update_position()
            self.ball.check_hit_table_top_or_bottom(self.table)
    
    def update_paddles(self):
        if not self.paused:
            self.paddle_left.update_paddle(self.table.top, self.table.bottom)
            self.paddle_right.update_paddle(self.table.top, self.table.bottom)