from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
import psycopg
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import os
from dotenv import load_dotenv
from jose import jwt, JWTError

from pass_gen_hash import sprawdz_wpisane_haslo

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ADMIN_PASS_HASH = os.getenv("ADMIN_PASS_HASH")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 30)

if not ADMIN_PASS_HASH:
    raise SystemExit("Brakuje ADMIN_PASS_HASH w .env")
elif not ALGORITHM:
    raise SystemExit("Brakuje ALGORITHM w .env")
elif not SECRET_KEY:
    raise SystemExit("Brakuje SECRET_KEY w .env")
elif not ACCESS_TOKEN_EXPIRE_MINUTES:
    raise SystemExit("Brakuje ACCESS_TOKEN_EXPIRE_MINUTES w .env")
else:
    print(f"Prawidłowo wczytano .env")

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/formularz/logowanie")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != "admin":
            raise HTTPException(status_code=403, detail="Brak uprawnień")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy lub wygasły token")

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
def dodaj_wpis(wpis: WpisPunktow, current_user: str = Depends(get_current_user)):
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

#Model logowania
class LoginRequest(BaseModel):
    haslo: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/formularz/logowanie", response_model=TokenResponse)
async def login(dane: LoginRequest):
    import bcrypt
    import os
    from dotenv import load_dotenv
    
    load_dotenv()

    hashed_pass = os.getenv("ADMIN_PASS_HASH")

    if not hashed_pass:
        raise HTTPException(status_code=500, detail="Brak hasła administratora w konfiguracji serwera")

    if not bcrypt.checkpw(dane.haslo.encode("utf-8"), hashed_pass.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Nieprawidłowe hasło")

    token = create_access_token({"sub": "admin"})

    return {"access_token": token, "token_type": "bearer"}

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy lub wygasły token")

@app.get("/formularz/verify")
async def verify(token: str):
    verify_token(token)
    return {"status": "ok"}

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

@app.delete("/delete/{wpis_id}")
def delete_wpis(wpis_id: int, current_user: str = Depends(get_current_user)):
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                # Sprawdź, czy wpis istnieje
                cur.execute("SELECT ID_wpisu FROM Wpisy_punktow WHERE id_wpisu = %s;", (wpis_id,))
                result = cur.fetchone()

                if not result:
                    raise HTTPException(status_code=404, detail="Wpis o podanym ID nie istnieje.")

                # Usuń wpis
                cur.execute("DELETE FROM Wpisy_punktow WHERE ID_wpisu = %s;", (wpis_id,))
                conn.commit()

        return {"message": f"Wpis o ID {wpis_id} został usunięty."}

    except psycopg.Error as e:
        print("Błąd bazy danych:", e)
        raise HTTPException(status_code=500, detail="Błąd połączenia z bazą danych.")

@app.get("/api/reload_listy")
def reload_listy():
    try:
        with psycopg.connect(conn_str, autocommit=True) as conn:
            with conn.cursor() as cur:
                cur.execute("CALL reload_lista_wpisow();")
        return {"message": "lista_wpisów_lekcji odświeżona"}


    except psycopg.Error as e:
        print("Błąd bazy danych:", e)
        raise HTTPException(status_code=500, detail="Błąd połączenia z bazą danych.")

@app.get("/api/select_jakie_wpisy/{Klasa}/{Przedmiot}")
async def select_jakie_wpisy(Klasa: str, Przedmiot: str):
    try:
        with psycopg.connect(conn_str) as conn:
            with conn.cursor() as cur:
                sql = """
                    SELECT * FROM jakie_wpisy_powinny_byc_na_przedmiot
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