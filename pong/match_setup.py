
import random, math

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
        self.speed = 0.005
        self.min_speed = 0.002
        self.max_speed = 0.05
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
                self.speed *= 0.7
            else:
                self.speed += paddle.speed * 0.3
            # self.speed = max(self.speed, self.max_speed)
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
        self.speed_increment = 0.001
        self.min_speed = 0.001
        self.max_speed = 0.04
        self.up_key_held = False
        self.down_key_held = False
    
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
  
class Match():
    winning_score = 2

    def __init__(self):
        self.consumer_instances = []
        self.player1_name = None
        self.player2_name = None
        self.table = Table()
        self.ball = Ball()
        self.paddle_left = Paddle(self.table.left)
        self.paddle_right = Paddle(self.table.right)
        self.score_player1 = 0
        self.score_player2 = 0
