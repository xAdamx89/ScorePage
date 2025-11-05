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
});
