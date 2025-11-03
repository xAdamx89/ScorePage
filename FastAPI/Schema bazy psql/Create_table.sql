CREATE TABLE Klasy (
    ID_Klasy SERIAL PRIMARY KEY,
    Klasa CHAR(2)
);

CREATE TABLE Lekcje (
    ID_Lekcji SERIAL PRIMARY KEY,
    ID_Klasy SMALLINT,
    ID_Przedmiotu SMALLINT
);

CREATE TABLE Przedmioty (
    ID_Przedmiotu SERIAL PRIMARY KEY,
    Nazwa_przedmiotu VARCHAR(255)
);

CREATE TABLE Uczniowie (
    ID_Ucznia SERIAL PRIMARY KEY,
    ID_Klasy SMALLINT,
    Numer_dziennik SMALLINT
);

CREATE TABLE Wpisy_punktow (
    ID_wpisu SERIAL PRIMARY KEY,
    Klasa_ucznia CHAR(2),
    Numer_ucznia SMALLINT,
    Uzyskane_punkty SMALLINT,
    Opis_zadania VARCHAR(255),
    Data_wpisu DATE,
    Mozliwe_pkt_do_uzyskania SMALLINT,
    Przedmiot VARCHAR(10)
); 

CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(50),
    user_agent TEXT,
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lista_lekcji (
    id SERIAL PRIMARY KEY,
    Klasa VARCHAR(2),
    Opis_lekcji VARCHAR(255),
    Przedmiot VARCHAR(10)
);
INSERT INTO lista_lekcji (Klasa, Opis_lekcji, Przedmiot)
SELECT DISTINCT Klasa_ucznia AS Klasa, Opis_zadania AS Opis_lekcji, Przedmiot FROM Wpisy_punktow;