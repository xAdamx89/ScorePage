# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Kopiujemy pliki projektu
COPY . /app

# Instalacja zależności
RUN pip install --no-cache-dir fastapi uvicorn psycopg[binary]

# Ustawienie portu
EXPOSE 8005

# Komenda startowa
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]


