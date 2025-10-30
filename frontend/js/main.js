document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("formularz");
    if (!form) return;

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

    // Wysyłanie wizyty do FastAPI
    fetch("https://fastapi.adam-mazurek.pl/api/visit", { method: "POST" })
        .catch(err => console.warn("Błąd zapisu wizyty:", err));

    // Formularz dodawania wpisu punktów
    const form1 = document.getElementById('wpisForm');
    if (form1) {
        form1.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                klasa_ucznia: document.getElementById('klasa_ucznia').value,
                numer_ucznia: parseInt(document.getElementById('numer_ucznia').value),
                uzyskane_punkty: parseInt(document.getElementById('uzyskane_punkty').value),
                opis_zadania: document.getElementById('opis_zadania').value,
                data_wpisu: new Date().toISOString().split('T')[0],
                mozliwe_pkt_do_uzyskania: parseInt(document.getElementById('mozliwe_pkt_do_uzyskania').value),
                przedmiot: document.getElementById('przedmiot').value
            };

            try {
                const response = await fetch('https://fastapi.adam-mazurek.pl/wpisy_punktow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    document.getElementById('status').textContent = 'Wpis dodany!';
                    form1.reset();
                } else {
                    const errData = await response.json();
                    document.getElementById('status').textContent = 'Błąd: ' + errData.detail;
                }
            } catch (err) {
                document.getElementById('status').textContent = 'Błąd sieci: ' + err;
            }
        });
    }


    document.getElementById("DeleteForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const wpisId = document.getElementById("wpis_id").value;

        if (!wpisId) {
            alert("Podaj ID wpisu do usunięcia!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/delete/${wpisId}`, {
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
