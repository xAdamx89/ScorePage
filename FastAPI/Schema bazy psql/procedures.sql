CREATE PROCEDURE reload_lista_wpisow()
LANGUAGE plpgsql
AS $$
BEGIN
    DROP TABLE  IF EXISTS lista_lekcji;

    CREATE TABLE lista_lekcji (
        id SERIAL PRIMARY KEY,
        Klasa VARCHAR(2),
        Opis_lekcji VARCHAR(255),
        Przedmiot VARCHAR(10)
    );

    INSERT INTO lista_lekcji (Klasa, Opis_lekcji, Przedmiot)
    SELECT DISTINCT Klasa_ucznia AS Klasa, Opis_zadania AS Opis_lekcji, Przedmiot FROM Wpisy_punktow;
END;
$$;
