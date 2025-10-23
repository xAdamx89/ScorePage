FROM nginx:alpine

# Czyścimy domyślny katalog z Nginx
RUN rm -rf /usr/share/nginx/html/*

# Kopiujemy wszystkie pliki projektu do katalogu serwowanego przez Nginx
COPY . /usr/share/nginx/html