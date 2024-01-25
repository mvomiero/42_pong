import subprocess
import pkg_resources
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time
from concurrent.futures import ThreadPoolExecutor, wait, ALL_COMPLETED

def install(library_name):
    subprocess.check_call([sys.executable, "-m", "pip", "install", library_name])

def is_library_installed(library_name):
    try:
        pkg_resources.get_distribution(library_name)
        return True
    except pkg_resources.DistributionNotFound:
        return False
def install_check(library_name):
    if is_library_installed(library_name):
        print(f"{library_name} is already installed.")
    else:
        print(f"{library_name} is not installed. Installing now...")
        install(library_name)
        print(f"{library_name} installed successfully.")

install_check("selenium")

def open_chrome_and_start_game(url, player_name):
    # driver = webdriver.Chrome()
    driver = webdriver.Firefox()
    try:
        driver.get(url)
        time.sleep(1)

        start_game_button = driver.find_element(By.ID, "startRemoteGameButton")
        driver.execute_script("window.scrollBy(0, 500);")
        time.sleep(1)
        if start_game_button.text == "Start Remote Game":
            start_game_button.click()

        player_name_input = driver.find_element(By.ID, "playerName")
        player_name_input.send_keys(player_name)

        match_selection = driver.find_element(By.ID, 'room_code')
        match_selection.click()

        dropdown_selector = Select(match_selection)
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, f"//select[@id='room_code']/option[@value='tournament']")))
        dropdown_selector.select_by_value("tournament")

        submit_button = driver.find_element(By.ID, "submitNameButton")
        submit_button.click()
        time.sleep(1)
    except Exception as e:
        print("I have some problem")
    finally:
        print("It's end")
    
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(open_chrome_and_start_game, 'http://127.0.0.1:8000/', "p1"),
               executor.submit(open_chrome_and_start_game, 'http://127.0.0.1:8000/', "p2"),
               executor.submit(open_chrome_and_start_game, 'http://127.0.0.1:8000/', "p3"),
               executor.submit(open_chrome_and_start_game, 'http://127.0.0.1:8000/', "p4"),
               ]
    wait(futures, return_when=ALL_COMPLETED)

