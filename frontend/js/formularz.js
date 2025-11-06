 document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Brak dostępu! Zaloguj się ponownie.");
        window.location.href = "logowanie.html";
        return;
    }

    // Formularz dodawania wpisu punktów
    document.getElementById("InsertForm").addEventListener("submit", async (e) => {
        e.preventDefault(); // blokuje standardowe wysłanie formularza
        console.log("Listener dla formularza podpięty");

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

        const data_wpisu = new Date().toISOString().slice(0,19);

        // Obiekt JSON do wysłania
        const wpis = {
            klasa_ucznia,
            numer_ucznia,
            uzyskane_punkty,
            opis_zadania,
            mozliwe_pkt_do_uzyskania,
            przedmiot,
            data_wpisu
        };

        try {
            const response = await fetch("https://fastapi.adam-mazurek.pl/wpisy_punktow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
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
        console.log("Listener dla formularza podpięty");

        const wpisId = document.getElementById("wpis_id").value;

        if (!wpisId) {
            alert("Podaj ID wpisu do usunięcia!");
            return;
        }

        try {
            const response = await fetch(`https://fastapi.adam-mazurek.pl/delete/${wpisId}`, {
                method: "DELETE",
                headers: {
                        "Authorization": `Bearer ${token}`
                }
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

    const odswiez = document.getElementById("odswiez_liste");
    odswiez.addEventListener("click", async (event) => {
        event.preventDefault(); // opcjonalne, jeśli przycisk w formularzu
        console.log("Listener dla formularza podpięty");

        try {
            const response = await fetch("https://fastapi.adam-mazurek.pl/api/reload_listy", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`  
                }
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                alert("Sesja wygasła. Zaloguj się ponownie.");
                localStorage.removeItem("authToken");
                window.location.href = "logowanie.html";
                return;
            }

            if (response.ok) {
                alert(data.message); // np. "Lista lekcji została odświeżona"
            } else {
                alert("Błąd: " + data.detail);
            }
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd połączenia z serwerem.");
        }
    });
});