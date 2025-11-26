from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from backend.config import Config
import time

def iniciar_driver():
    options = webdriver.ChromeOptions()
    if Config.HEADLESS_MODE:
        options.add_argument("--headless")
    
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--ignore-certificate-errors")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

def fazer_login(driver):
    try:
        print(f"Acessando Tasy em: {Config.TASY_URL}")
        driver.get(Config.TASY_URL)
        wait = WebDriverWait(driver, 20)

        # Preencher Login
        user_field = wait.until(EC.element_to_be_clickable((By.ID, "loginUsername")))
        # Localiza senha e botão
        try:
            pass_field = driver.find_element(By.ID, "loginPassword")
        except:
             # Fallback se o ID for diferente
             pass_field = driver.find_element(By.NAME, "password")
             
        # Tenta achar o botão de login
        try:
            btn_login = driver.find_element(By.XPATH, "//input[@type='submit' or @type='button']")
        except:
            btn_login = driver.find_element(By.CSS_SELECTOR, ".btn-login")

        user_field.clear()
        user_field.send_keys(Config.TASY_WEB_USER)
        pass_field.clear()
        pass_field.send_keys(Config.TASY_WEB_PASS)
        
        btn_login.click()
        
        try:
            # Espera no MÁXIMO 5 segundos pelo popup. Se não aparecer, segue a vida.
            wait_popup = WebDriverWait(driver, 5)
            botao_ok = wait_popup.until(EC.element_to_be_clickable((By.ID, "w-dialog-box-ok-button")))
            
            if botao_ok.is_displayed():
                print("Popup detectado. Clicando em OK...")
                botao_ok.click()
                time.sleep(1) # Espera a animação de fechar
        except:
            pass

        # Aguarda carregamento da home (input de pesquisa global)
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@ng-model='search']")))
        print("Login realizado com sucesso.")
        return True

    except Exception as e:
        print(f"Erro Fatal no Login: {e}")
        raise