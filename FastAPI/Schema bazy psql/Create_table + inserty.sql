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

-- Inserty dla Azr 4g
INSERT INTO jakie_wpisy_powinny_byc_na_przedmiot (Klasa, Opis_lekcji, Przedmiot, Mozliwe_pkt_do_uzyskania) VALUES
('4g', 'Wprowadzenie w MotoSim - Tworzenie modeli', 'Azr', 4),
('4g', 'Tworzenie wizualizacji podnoszenia bloczku w MotoSim', 'Azr', 4),
('4g', 'Tworzenie wizualizacji paletyzacji', 'Azr', 4),
('4g', 'Tworzenie kopii zapasowej w MotoSim', 'Azr', 4),
('4g', 'Projektowanie stanowiska zrobotyzowanego spawania z robotem Yaskawa HC10', 'Azr', 10);

-- Inserty dla PiER 4g
INSERT INTO jakie_wpisy_powinny_byc_na_przedmiot (Klasa, Opis_lekcji, Przedmiot, Mozliwe_pkt_do_uzyskania) VALUES
('4g', 'Pierwsze - ćwiczenie programistyczne w MotoSim', 'PiER', 4),
('4g', 'Ćw 1 - podr. pdst - pdst. interpolacji w MotoSim', 'PiER', 4),
('4g', 'Ćw 2 - podr. pdst - Kopia bezpieczeństwa', 'PiER', 4),
('4g', 'Ćw 3 - podr. pdst - System wykrywania kolizji', 'PiER', 4),
('4g', 'ćw 4 - podr. pdst - Definicja układu wspł. użytkownika', 'PiER', 4),
('4g', 'Ćw 5 - podr. pdst - Badanie funckji PL', 'PiER', 4),
('4g', 'Ćw 6 - podr. pdst - Definicja narzędzia', 'PiER', 4);

-- Inserty dla PPiEP 4g
INSERT INTO jakie_wpisy_powinny_byc_na_przedmiot (Klasa, Opis_lekcji, Przedmiot, Mozliwe_pkt_do_uzyskania) VALUES
('4g', 'FFSim - ele. pn. z ELM.08', 'PPiEP', 4),
('4g', 'Pisanie programu niesekwencyjnego w FBD', 'PPiEP', 4),
('4g', 'Pisanie programu sekwencyjnego w FBD', 'PPiEP', 4),
('4g', 'Zaliczenie z pisania w FBD', 'PPiEP', 4),
('4g', 'Projektowanie sterowania pneumatycznej wiertarki z UiSM cz.2', 'PPiEP', 4),
('4g', 'Program w FBD sterowania taśmociągiem z ELM.08', 'PPiEP', 4),
('4g', 'Sprawozdanie z przemysłowej dok. tech', 'PPiEP', 10);

-- Insert dla PRob 4g wykłady
INSERT INTO jakie_wpisy_powinny_byc_na_przedmiot (Klasa, Opis_lekcji, Przedmiot, Mozliwe_pkt_do_uzyskania) VALUES
('4g', 'Zeszyt 1', 'PRob', 1),
('4g', 'Zeszyt 2', 'PRob', 1),
('4g', 'Kartkówka 1', 'PRob', 23);
 