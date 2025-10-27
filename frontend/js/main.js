document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formularz");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // blokuje przeładowanie strony

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
            const response = await fetch(
                `http://fastpapi.adam-mazurek.pl/klasa_uczen_przedmiot/${klasa}/${numer}/${przedmiot}`
            );

            if (!response.ok) {
                throw new Error("Błąd połączenia z serwerem");
            }

            const data = await response.json();
            console.log("Odpowiedź z FastAPI:", data);

            const tabelaNaglowki = document.getElementById("naglowki");
            const tabelaWiersze = document.getElementById("wiersze");

            tabelaNaglowki.innerHTML = "";
            tabelaWiersze.innerHTML = "";

            if (!data.result || data.result.length === 0) {
                tabelaWiersze.innerHTML = "<tr><td colspan='100%'>Brak danych</td></tr>";
                return;
            }

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

        } catch (error) {
            console.error("Błąd pobierania danych:", error);
            alert("Wystąpił błąd przy pobieraniu danych");
        }
    });
});

window.addEventListener("load", () => {
  fetch("https://fastapi.adam-mazurek.pl/api/visit", { method: "POST" })
    .catch(err => console.warn("Błąd zapisu wizyty:", err));
});
