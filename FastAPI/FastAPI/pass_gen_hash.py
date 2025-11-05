import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_PASS_HASH = os.getenv("ADMIN_PASS_HASH")

if not ADMIN_PASS_HASH:
    raise SystemExit("Brakuje ADMIN_PASS_HASH w .env")

ADMIN_PASS_HASH = ADMIN_PASS_HASH.encode()

def sprawdz_wpisane_haslo(Wpisane_pass) -> bool:
    return bcrypt.checkpw(Wpisane_pass.encode(), ADMIN_PASS_HASH)

if __name__ == "__main__":
    # przykładowe testy przy wywoływaniu bezpośrednim z terminala
    for test in ("9089", "9098", "9999", "9089"):
        print(test, "->", "OK" if sprawdz_wpisane_haslo(test) else "WRONG")