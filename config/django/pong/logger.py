import logging

def logger():
    logger = logging.getLogger('pong')
    logger.setLevel(logging.DEBUG)

    file_handler = logging.FileHandler('/logs/pong.log')
    formatter = logging.Formatter('%(asctime)s - %(filename)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    return logger
