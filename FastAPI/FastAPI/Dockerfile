# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

# Instalacja zależności
RUN pip install --no-cache-dir -r requirements.txt

# Potem kopiujemy resztę plików projektu (łącznie z .env)
COPY . .

# Ustawienie portu
EXPOSE 8005

# Komenda startowa
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
