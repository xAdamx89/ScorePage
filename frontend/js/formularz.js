document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Brak dostępu! Zaloguj się ponownie.");
        window.location.href = "logowanie.html";
        return;
    }

    // ------------------- Dodawanie wpisu punktów -------------------
    const insertForm = document.getElementById("InsertForm");
    insertForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Listener dla InsertForm podpięty");

        const klasa_ucznia = document.getElementById("klasa_ucznia").value.trim();
        const numer_ucznia = parseInt(document.getElementById("numer_ucznia").value, 10);
        const uzyskane_punkty = parseFloat(document.getElementById("uzyskane_punkty").value);
        const opis_zadania = document.getElementById("opis_zadania").value.trim();
        const mozliwe_pkt_do_uzyskania = parseFloat(document.getElementById("mozliwe_pkt_do_uzyskania").value);
        const przedmiot = document.getElementById("przedmiot").value.trim();

        if (!klasa_ucznia || isNaN(numer_ucznia) || isNaN(uzyskane_punkty) || !opis_zadania || isNaN(mozliwe_pkt_do_uzyskania) || !przedmiot) {
            alert("Proszę wypełnić wszystkie pola poprawnie!");
            return;
        }

        const data_wpisu = new Date().toISOString().slice(0,19);
        const wpis = { klasa_ucznia, numer_ucznia, uzyskane_punkty, opis_zadania, mozliwe_pkt_do_uzyskania, przedmiot, data_wpisu };

        try {
            const response = await fetch("https://fastapi.adam-mazurek.pl/wpisy_punktow", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(wpis)
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                alert("Sesja wygasła. Zaloguj się ponownie.");
                localStorage.removeItem("authToken");
                window.location.href = "logowanie.html";
                return;
            }

            if (response.ok) {
                alert(data.message);
                document.getElementById("numer_ucznia").value = "";
            } else {
                alert("Błąd: " + data.detail);
            }
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd połączenia z serwerem.");
        }
    });

    // ------------------- Usuwanie wpisu -------------------
    const deleteForm = document.getElementById("DeleteForm");
    deleteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Listener dla DeleteForm podpięty");

        const wpisId = document.getElementById("wpis_id").value;
        if (!wpisId) {
            alert("Podaj ID wpisu do usunięcia!");
            return;
        }

        try {
            const response = await fetch(`https://fastapi.adam-mazurek.pl/delete/${wpisId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                alert("Sesja wygasła. Zaloguj się ponownie.");
                localStorage.removeItem("authToken");
                window.location.href = "logowanie.html";
                return;
            }

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

    // ------------------- Odświeżanie listy -------------------
    const odswiez = document.getElementById("odswiez_liste");
    odswiez.addEventListener("click", async (e) => {
        e.preventDefault();
        console.log("Listener dla odswiez_liste podpięty");

        try {
            const response = await fetch("https://fastapi.adam-mazurek.pl/api/reload_listy", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                alert("Sesja wygasła. Zaloguj się ponownie.");
                localStorage.removeItem("authToken");
                window.location.href = "logowanie.html";
                return;
            }

            if (response.ok) {
                alert(data.message);
            } else {
                alert("Błąd: " + data.detail);
            }
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd połączenia z serwerem.");
        }
    });

    // ------------------- Formularz sprawdzania punktów i listy zajęć -------------------
    const formularz = document.getElementById("formularz");
    formularz.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Listener dla #formularz podpięty");

        const listaNapis = document.getElementById("lista-napis");
        if (listaNapis) listaNapis.innerHTML = "Lista wszystkich wpisów";

        const klasy = Array.from(document.querySelectorAll('input[name="klasa"]:checked')).map(el => el.value);
        const przedmioty = Array.from(document.querySelectorAll('input[name="przedmiot"]:checked')).map(el => el.value);
        const numer = parseInt(document.getElementById("Numer").value, 10);

        if (klasy.length === 0 || przedmioty.length === 0 || isNaN(numer)) {
            alert("Proszę zaznaczyć przynajmniej jedną klasę, jeden przedmiot oraz numer w dzienniku");
            return;
        }

        const klasa = klasy[0];
        const przedmiot = przedmioty[0];

        try {
            // Punkty ucznia
            const response = await fetch(`https://fastapi.adam-mazurek.pl/klasa_uczen_przedmiot/${klasa}/${numer}/${przedmiot}`);
            const data = await response.json();

            // Lista zajęć
            let response1;
            if (klasa !== "5g") {
                response1 = await fetch(`https://fastapi.adam-mazurek.pl/api/get_lista/${klasa}/${przedmiot}`);
            } else {
                response1 = await fetch(`https://fastapi.adam-mazurek.pl/api/select_jakie_wpisy/${klasa}/${przedmiot}`);
            }
            const result1 = await response1.json();

            if (!response.ok || !response1.ok) throw new Error("Błąd połączenia z serwerem");

            // --- Tabela punktów ---
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
                        td.textContent = row[col] ?? "";
                        tr.appendChild(td);
                    });
                    tabelaWiersze.appendChild(tr);
                });
            }

            // --- Tabela lista zajęć ---
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
                        td.textContent = row[col] ?? "";
                        tr.appendChild(td);
                    });
                    tabelaWiersze2.appendChild(tr);
                });
            }

        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd przy pobieraniu danych");
        }
    });
});