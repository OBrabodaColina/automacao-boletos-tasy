from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from backend.selenium.tasy_login import iniciar_driver, fazer_login
import time

def wait_click(driver, locator, timeout=20):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable(locator)
    )

def processar_lote_titulos(lista_titulos):
    driver = None
    resultados = []

    try:
        print("Iniciando Driver e Login...")
        driver = iniciar_driver()
        fazer_login(driver)
        wait = WebDriverWait(driver, 15)

        # Navegar até a função
        print("Navegando para Manutenção de Títulos...")
        search_box = wait.until(EC.element_to_be_clickable((By.XPATH, "//input[@ng-model='search']")))
        search_box.send_keys("Manutenção de Títulos a Receber")
        time.sleep(1.5) 
        
        funcao = wait_click(driver, (By.XPATH, "//span[contains(@class,'w-feature-app__name') and contains(text(),'Manutenção de Títulos a Receber')]"))
        funcao.click()
        
        # Aguarda carregamento inicial da tela
        wait.until(EC.presence_of_element_located((By.NAME, "NR_TITULO")))

        for nr_titulo in lista_titulos:
            resultado_item = {
                "nr_titulo": nr_titulo, 
                "status": "PENDENTE", 
                "detalhe": ""
            }
            
            try:
                print(f"Processando título: {nr_titulo}")
                
                # Limpar e Preencher Filtro
                campo_titulo = wait.until(EC.element_to_be_clickable((By.NAME, "NR_TITULO")))
                campo_titulo.clear()
                campo_titulo.send_keys(str(nr_titulo))

                botao_filtrar = driver.find_element(By.XPATH, "//button[contains(@class,'wfilter-button') and contains(text(),'Filtrar')]")
                botao_filtrar.click()

                time.sleep(1) 

                # Interagir com a Grid
                linha = wait.until(EC.element_to_be_clickable((
                    By.CSS_SELECTOR, 
                    "div.ui-widget-content.slick-row"
                )))

                linha.click() 
                ActionChains(driver).context_click(linha).perform()

                # Interagir com Menu Contexto (Boletos)
                item_boletos = wait.until(EC.visibility_of_element_located((
                    By.XPATH, "//div[contains(@class,'wpopupmenu__label') and normalize-space()='Boletos']/parent::li"
                )))
                
                ActionChains(driver).move_to_element(item_boletos).perform()
                time.sleep(1.0) # Pausa para renderização do submenu

                # Clicar em "Enviar por e-mail" 
                try:
                    # Tenta localizar pelo Tooltip
                    submenu_email = wait.until(EC.presence_of_element_located((
                        By.XPATH, "//li[@uib-tooltip='Enviar por e-mail']"
                    )))
                    # Força o clique via JS para evitar erros de animação/sobreposição
                    driver.execute_script("arguments[0].click();", submenu_email)
                except:
                    # Fallback pelo texto visual
                    submenu_texto = driver.find_element(By.XPATH, "//div[contains(text(), 'Enviar por e-mail')]")
                    driver.execute_script("arguments[0].click();", submenu_texto)

                # Primeiro OK 
                try:
                    botao_ok_params = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((
                        By.XPATH, 
                        "//button[contains(@class, 'btn-blue') and .//span[normalize-space()='OK']]"
                    )))
                    botao_ok_params.click()
                    resultado_item["detalhe"] = "Email confirmado."
                except:
                    print("Primeiro OK não apareceu (fluxo direto?).")

                # Segundo OK
                try:
                    # Usa o ID específico que você forneceu: w-dialog-box-ok-button
                    # Espera um pouco mais pois o envio de email pode demorar uns segundos
                    botao_ok_final = WebDriverWait(driver, 60).until(EC.element_to_be_clickable((
                        By.ID, "w-dialog-box-ok-button"
                    )))
                    
                    # Clica no OK final
                    botao_ok_final.click()
                    
                    resultado_item["detalhe"] += " Processo finalizado com sucesso."
                    time.sleep(1) # Aguarda modal fechar visualmente
                    
                except Exception as e:
                    # Se não aparecer, não falha o processo, apenas avisa
                    print(f"Aviso: OK Final (w-dialog-box-ok-button) não apareceu: {e}")
                

                resultado_item["status"] = "SUCESSO"

                # Limpeza: Garante que qualquer menu/modal residual feche com ESC
                ActionChains(driver).send_keys(Keys.ESCAPE).perform()

            except Exception as e:
                print(f"Erro no título {nr_titulo}: {e}")
                resultado_item["status"] = "FALHA"
                resultado_item["detalhe"] = str(e)
                try:
                    ActionChains(driver).send_keys(Keys.ESCAPE).perform()
                except:
                    pass

            resultados.append(resultado_item)

    except Exception as e:
        print(f"Erro Crítico no Lote: {e}")
        for t in lista_titulos:
            if not any(r['nr_titulo'] == t for r in resultados):
                resultados.append({"nr_titulo": t, "status": "FALHA", "detalhe": "Erro Crítico no Navegador"})
    
    finally:
        if driver:
            driver.quit()
    
    return resultados