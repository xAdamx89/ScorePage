from typing import Union
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World from FastAPI on Docker!"}

@app.get("checkdb_conn")
def checkdb_conn():
    return {"Hello": "World"}
