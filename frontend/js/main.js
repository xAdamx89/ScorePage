document.addEventListener("DOMContentLoaded", () => {
    //Rejestracja wizyty na stronie
    fetch("https://fastapi.adam-mazurek.pl/api/visit", { method: "POST" })
    .catch(err => console.warn("Błąd zapisu wizyty:", err));

    const form = document.getElementById("formularz");
    if (!form) return;

    // Formularz selecta Wpisów dla ucznia po przedmiocie i klasy
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // blokuje przeładowanie strony

        const listaNapis = document.getElementById("lista-napis");
        if (listaNapis) {
            listaNapis.innerHTML = "Lista wszystkich wpisów";
        } else {
            console.warn("Nie znaleziono elementu #lista-napis w DOM");
        }


        const klasy = Array.from(document.querySelectorAll('input[name^="klasa"]:checked'))
                            .map(el => el.value);
        const przedmioty = Array.from(document.querySelectorAll('input[name="przedmiot"]:checked'))
                                 .map(el => el.value);
        const numer = document.getElementById("Numer").value;

        if (klasy.length === 0 || przedmioty.length === 0) {
            alert("Proszę zaznaczyć przynajmniej jedną klasę i jeden przedmiot");
            return;
        }

        const klasa = klasy[0];
        const przedmiot = przedmioty[0];

        try {
            // Pierwszy fetch — punkty ucznia
            const response = await fetch(
                `https://fastapi.adam-mazurek.pl/klasa_uczen_przedmiot/${klasa}/${numer}/${przedmiot}`
            );

            // Drugi fetch — lista zajęć
            const response1 = await fetch(
                `https://fastapi.adam-mazurek.pl/api/get_lista/${klasa}/${przedmiot}`
            );

            if (!response.ok || !response1.ok) {
                throw new Error("Błąd połączenia z serwerem");
            }

            const data = await response.json();
            const result1 = await response1.json();

            // Tabela punktów ucznia
            const tabelaNaglowki = document.getElementById("naglowki-punkty");
            const tabelaWiersze = document.getElementById("wiersze-punkty");
            tabelaNaglowki.innerHTML = "";
            tabelaWiersze.innerHTML = "";

            if (!data.result || data.result.length === 0) {
                tabelaWiersze.innerHTML = "<tr><td colspan='100%'>Brak danych</td></tr>";
            } else {
                const columns = Object.keys(data.result[0]);
                columns.forEach(col => {
                    const th = document.createElement("th");
                    th.textContent = col;
                    tabelaNaglowki.appendChild(th);
                });

                data.result.forEach(row => {
                    const tr = document.createElement("tr");
                    columns.forEach(col => {
                        const td = document.createElement("td");
                        td.textContent = row[col];
                        tr.appendChild(td);
                    });
                    tabelaWiersze.appendChild(tr);
                });
            }

            // Tabela lista zajęć
            const tabelaNaglowki2 = document.getElementById("naglowki-lista");
            const tabelaWiersze2 = document.getElementById("wiersze-lista");
            tabelaNaglowki2.innerHTML = "";
            tabelaWiersze2.innerHTML = "";

            if (!result1.result || result1.result.length === 0) {
                tabelaWiersze2.innerHTML = "<tr><td colspan='100%'>Brak danych</td></tr>";
            } else {
                const columns2 = Object.keys(result1.result[0]);
                columns2.forEach(col => {
                    const th = document.createElement("th");
                    th.textContent = col;
                    tabelaNaglowki2.appendChild(th);
                });

                result1.result.forEach(row => {
                    const tr = document.createElement("tr");
                    columns2.forEach(col => {
                        const td = document.createElement("td");
                        td.textContent = row[col];
                        tr.appendChild(td);
                    });
                    tabelaWiersze2.appendChild(tr);
                });
            }

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
            alert("Wystąpił błąd przy pobieraniu danych");
        }
    });


    // Formularz dodawania wpisu punktów
    document.getElementById("InsertForm").addEventListener("submit", async (e) => {
        e.preventDefault(); // blokuje standardowe wysłanie formularza

        // Pobranie wartości z formularza
        const klasa_ucznia = document.getElementById("klasa_ucznia").value.trim();
        const numer_ucznia = parseInt(document.getElementById("numer_ucznia").value, 10);
        const uzyskane_punkty = parseFloat(document.getElementById("uzyskane_punkty").value);
        const opis_zadania = document.getElementById("opis_zadania").value.trim();
        const mozliwe_pkt_do_uzyskania = parseFloat(document.getElementById("mozliwe_pkt_do_uzyskania").value);
        const przedmiot = document.getElementById("przedmiot").value.trim();

        // Walidacja prostych danych
        if (!klasa_ucznia || isNaN(numer_ucznia) || isNaN(uzyskane_punkty) || !opis_zadania || isNaN(mozliwe_pkt_do_uzyskania) || !przedmiot) {
            alert("Proszę wypełnić wszystkie pola poprawnie!");
            return;
        }

        // Obiekt JSON do wysłania
        const wpis = {
            klasa_ucznia,
            numer_ucznia,
            uzyskane_punkty,
            opis_zadania,
            mozliwe_pkt_do_uzyskania,
            przedmiot
        };

        try {
            const response = await fetch("https://fastapi.adam-mazurek.pl/wpisy_punktow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(wpis)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                //wyczyść pole numer_ucznia
                document.getElementById("numer_ucznia").value = "";
            } else {
                alert("Błąd: " + data.detail);
            }
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd połączenia z serwerem.");
        }
    });

    // Formularz usuwania wpisu punktów po ID_wpisu
    document.getElementById("DeleteForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const wpisId = document.getElementById("wpis_id").value;

        if (!wpisId) {
            alert("Podaj ID wpisu do usunięcia!");
            return;
        }

        try {
            const response = await fetch(`https://fastapi.adam-mazurek.pl/delete/${wpisId}`, {
            method: "DELETE",
            });

            if (response.ok) {
            const data = await response.json();
            alert(data.message);
            } else {
            const error = await response.json();
            alert("Błąd: " + error.detail);
            }
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd połączenia z serwerem w DeleteForm.");
        }
    });

});
