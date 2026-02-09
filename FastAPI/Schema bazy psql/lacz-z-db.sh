#!/bin/bash
echo "Rozpoczynam łączenie z bazą danych psql..."
sudo docker exec -it fastapi_postgres_db psql -U adam -d zsl
