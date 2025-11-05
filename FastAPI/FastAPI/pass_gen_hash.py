import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_PASS_HASH = os.getenv("ADMIN_PASS_HASH")

def sprawdz_wpisane_haslo(Wpisane_pass) -> bool:
    if not ADMIN_PASS_HASH:
        raise SystemExit("Brakuje ADMIN_PASS_HASH w .env")

    hashed_pass = ADMIN_PASS_HASH.encode()

    return bcrypt.checkpw(Wpisane_pass.encode(), hashed_pass)

if __name__ == "__main__":
    if not ADMIN_PASS_HASH:
        raise SystemExit("Brakuje ADMIN_PASS_HASH w .env")
    
    # przykładowe testy przy wywoływaniu bezpośrednim z terminala
    for test in ("9089", "9098", "9999", "9089"):
        print(test, "->", "OK" if sprawdz_wpisane_haslo(test) else "WRONG")