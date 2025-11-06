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

CREATE TABLE jakie_wpisy_powinny_byc_na_przedmiot (
    id SERIAL PRIMARY KEY,
    Klasa VARCHAR(2),
    Opis_lekcji VARCHAR(255),
    Przedmiot VARCHAR(10),
    Mozliwe_pkt_do_uzyskania SMALLINT
);
-- Insert dla PiER 5g
INSERT INTO jakie_wpisy_powinny_byc_na_przedmiot (Klasa, Opis_lekcji, Przedmiot, Mozliwe_pkt_do_uzyskania) VALUES
('5g', 'Ćw manualne - zaciskanie przewodów', 'PiER', 6),
('5g', 'Lua nr 1 - praktyczne zapoznanie', 'PiER', 4),
('5g', 'Lua nr 2 - trzy zadania pdst + zaaw', 'PiER', 15),
('5g', 'Ćw pierwsze prog Dobota w Lua', 'PiER', 4),
('5g', 'paletyzacja Dobotem - prosta', 'PiER', 4),
('5g', 'paletyzacja Dobotem - zaawansowane', 'PiER', 4),
('5g', 'egzamin 1 ELM.08', 'PiER', 4),
('5g', 'egzamin 2 ELM.08', 'PiER', 4),
('5g', 'egzamin 3 ELM.08', 'PiER', 4),
('5g', 'egzamin 4 ELM.08', 'PiER', 4),
('5g', 'sprawozdanie', 'PiER', 10);

-- Insert dla Azr 5g
INSERT INTO jakie_wpisy_powinny_byc_na_przedmiot (Klasa, Opis_lekcji, Przedmiot, Mozliwe_pkt_do_uzyskania) VALUES
('5g', 'paletyzacja Dobotem - prosta', 'Azr', 4),
('5g', 'paletyzacja Dobotem - zaawansowane', 'Azr', 4),
('5g', 'egzamin 1 ELM.08', 'Azr', 4),
('5g', 'egzamin 2 ELM.08', 'Azr', 4),
('5g', 'egzamin 3 ELM.08', 'Azr', 4),
('5g', 'egzamin 4 ELM.08', 'Azr', 4);
