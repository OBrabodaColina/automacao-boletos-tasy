import oracledb
from backend.config import Config

def init_oracle_client():
    """
    Inicializa o OracleInstant Client se configurado (Thick Mode).
    Necessário para versões antigas do Oracle (11g ou anterior) ou recursos avançados.
    """
    if Config.ORACLE_CLIENT_LIB_DIR: 
        try:
            # Tenta inicializar o cliente com o diretório fornecido
            oracledb.init_oracle_client(lib_dir=Config.ORACLE_CLIENT_LIB_DIR)
        except oracledb.ProgrammingError:
            pass
        except Exception as e:
            print(f"Aviso: Falha ao inicializar Oracle Client em {Config.ORACLE_CLIENT_LIB_DIR}: {e}")

# Chama a inicialização ao carregar o módulo (uma única vez)
init_oracle_client()

def get_db_connection():
    """
    Estabelece conexão com Oracle Database.
    """
    try:
        connection = oracledb.connect(
            user=Config.ORACLE_USER,
            password=Config.ORACLE_PASS,
            dsn=Config.ORACLE_DSN
        )
        return connection
    except oracledb.Error as e:
        print(f"Erro na conexão Oracle: {e}")
        raise

def buscar_titulos(filtros):
    """
    Busca títulos utilizando a query complexa do Tasy.
    """
    conn = None
    cursor = None
    
    # Query SQL Tasy
    sql = """
    SELECT
      SUBSTR(obter_valor_dominio(710, a.ie_situacao), 1, 254) ds_status_titulo,
      a.nr_titulo,
      a.vl_titulo,
      a.vl_saldo_titulo,
      ROUND(obter_dados_titulo_receber(a.nr_titulo, 'R'), 2) vl_recebido,
      a.dt_vencimento dt_vencimento,
      TRUNC(a.dt_liquidacao) dt_liquidacao,
      DECODE(
        a.cd_pessoa_fisica, NULL,
        REGEXP_REPLACE(LPAD(a.cd_cgc, 14), '([0-9]{2})([0-9]{3})([0-9]{3})([0-9]{4})', '\\1.\\2.\\3/\\4-'),
        REGEXP_REPLACE(LPAD(obter_dados_pf(a.cd_pessoa_fisica, 'CPF'), 11), '([0-9]{3})([0-9]{3})([0-9]{3})', '\\1.\\2.\\3-')
      ) ds_cpf_cnpj,
      SUBSTR(obter_nome_pf_pj(a.cd_pessoa_fisica, a.cd_cgc), 1, 255) nm_pessoa,
      a.nr_seq_classe || DECODE(a.nr_seq_classe,NULL,NULL,' - ') || SUBSTR(obter_dados_titulo_receber(a.nr_titulo, 'DCL'), 1, 255) ds_classificao_titulo,
      a.ie_tipo_titulo || DECODE(a.ie_tipo_titulo,NULL,NULL,' - ') || SUBSTR(obter_valor_dominio(712, a.ie_tipo_titulo), 1, 255) ds_tipo_titulo,
      a.ie_origem_titulo || DECODE(a.ie_origem_titulo,NULL,NULL,' - ') || SUBSTR(obter_valor_dominio(709, a.ie_origem_titulo), 1, 255) ds_origem
    FROM titulo_receber a
    WHERE 1 = 1
    """
    params = {}

    if filtros.get('nr_titulo'):
        sql += " AND a.nr_titulo = :nr_titulo"
        params['nr_titulo'] = filtros['nr_titulo']

    if filtros.get('status'):
        sql += " AND SUBSTR(obter_valor_dominio(710, a.ie_situacao), 1, 254) = :status"
        params['status'] = filtros['status']
    
    if filtros.get('pessoa'):
        sql += " AND UPPER(obter_nome_pf_pj(a.cd_pessoa_fisica, a.cd_cgc)) LIKE UPPER(:pessoa)"
        params['pessoa'] = f"%{filtros['pessoa']}%"

    if filtros.get('dt_inicio') and filtros.get('dt_fim'):
        sql += " AND a.dt_vencimento BETWEEN TO_DATE(:dt_inicio, 'YYYY-MM-DD') AND TO_DATE(:dt_fim, 'YYYY-MM-DD')"
        params['dt_inicio'] = filtros['dt_inicio']
        params['dt_fim'] = filtros['dt_fim']

    sql += " AND ROWNUM <= 10000"

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(sql, params)
        
        columns = [col[0] for col in cursor.description]
        cursor.rowfactory = lambda *args: dict(zip(columns, args))
        data = cursor.fetchall()
        return data
    except Exception as e:
        print(f"Erro ao executar query: {e}")
        raise
    finally:
        if cursor: cursor.close()
        if conn: conn.close()