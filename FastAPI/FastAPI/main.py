from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from pydantic import BaseModel
from datetime import datetime, date
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conn_str = "dbname=zsl user=adam password=adam host=db port=5432"

root_conn_str = "dbname=zsl user=postgres password=9089 host=db port=5432"

@app.get("/")
def test():
    return {"Kontener FastAPI": "Działa"}

@app.get("/all")
def select_star():
    try:
        with psycopg.connect(root_conn_str) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    "SELECT * FROM Wpisy_punktow"
                )

                columns = [desc[0] for desc in cur.description]  # nazwy kolumn
                rows = cur.fetchall()
                result = [dict(zip(columns, row)) for row in rows]  # lista słowników
                return {"result": result}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/klasa_przedmiot/{klasa}/{przedmiot}")
def klasa_przedmiot(klasa: str, przedmiot: str):
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:

                cur.execute(
                    "SELECT * FROM Wpisy_punktow WHERE Klasa_ucznia = %s AND przedmiot = %s ORDER BY Data_wpisu",
                    (klasa, przedmiot)
                )

                columns = [desc[0] for desc in cur.description]  # nazwy kolumn
                rows = cur.fetchall()
                result = [dict(zip(columns, row)) for row in rows]  # lista słowników
                return {"result": result}

            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/klasa_uczen_przedmiot/{klasa}/{numer_ucznia}/{przedmiot}")
def klasa_uczen_przedmiot(klasa: str, numer_ucznia: int, przedmiot: str):
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT * 
                    FROM Wpisy_punktow 
                    WHERE Klasa_ucznia = %s 
                      AND Przedmiot = %s 
                      AND Numer_ucznia = %s
                    ORDER BY Data_wpisu
                    """,
                    (klasa, przedmiot, numer_ucznia)
                )

                rows = cur.fetchall()
                if not rows:
                    return {"result": []}

                columns = [desc[0] for desc in cur.description]
                result = [dict(zip(columns, row)) for row in rows]
                return {"result": result}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Model danych wpisu punktów
class WpisPunktow(BaseModel):
    klasa_ucznia: str
    numer_ucznia: int
    uzyskane_punkty: int
    opis_zadania: str
    data_wpisu: str
    mozliwe_pkt_do_uzyskania: int
    przedmiot: str

@app.post("/wpisy_punktow")
def dodaj_wpis(wpis: WpisPunktow):
    try:
        # Połączenie z bazą
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                sql = """
                    INSERT INTO Wpisy_punktow
                    (klasa_ucznia, numer_ucznia, uzyskane_punkty, opis_zadania, data_wpisu, mozliwe_pkt_do_uzyskania, przedmiot)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cur.execute(sql, (
                    wpis.klasa_ucznia,
                    wpis.numer_ucznia,
                    wpis.uzyskane_punkty,
                    wpis.opis_zadania,
                    date.today().isoformat(),  # aktualna data w formacie YYYY-MM-DD
                    wpis.mozliwe_pkt_do_uzyskania,
                    wpis.przedmiot
                ))
            conn.commit()

        return {"message": "Wpis został dodany pomyślnie!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/formularz/{haslo}")
def sprawdz_haslo(haslo: str):
    return {"Czy_prawidłowe": "Tak"} if haslo == "9089" else {"Czy_prawidłowe": "Nie"}

@app.post("/api/visit")
async def record_visit(request: Request):
    ip = request.client.host
    ua = request.headers.get("user-agent", "unknown")

    conn = psycopg.connect(conn_str)
    cur = conn.cursor()
    cur.execute("INSERT INTO visits (ip_address, user_agent, visit_time) VALUES (%s, %s, %s)", (ip, ua, datetime.now()))
    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Visit recorded"}

@app.get("/api/get_lista/{Klasa}/{Przedmiot}")
async def select(Klasa: str, Przedmiot: str):
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                sql = """
                    SELECT * FROM lista_lekcji
                    WHERE Klasa = %s AND Przedmiot = %s
                """
                cur.execute(sql, (Klasa, Przedmiot))
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()

        # Zamiana wyników na listę słowników
        result = [dict(zip(columns, row)) for row in rows]

        return {"result": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
