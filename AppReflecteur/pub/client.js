//charger les messages depuis le serveur
async function loadMes() {
    try {
        const res = await fetch('/tot-messages');
        // si ça marche pas 
        if (!res.ok) {
            throw new Error('Something went wrong');
        }
        // maintenant on doit prendre les données et bien les mettre en format json ( même si elles sont envoyés comme ça)
        const mes = await res.json();
        const base = document.getElementById("messages-list"); // coté client oú on va afficher les messages 
        // on vérifie que ça existe 
        if (!base) {
            console.error("Le feed n'est pas bien défini");
            return;
        }
        //vider avant de recharger
        base.innerHTML = "";
        // maitenant on doit faire une boucle pour afficher les messages 
        mes.forEach(el => {
            //pour chaque element on doit définir les différentes parties du message pour l'affichage 
            //1ère le message en entier ou on va avoir 2 parties
            const mes_tot = document.createElement("div");
            mes_tot.className = "message";
            // le head que va etre la date et le user 
            const head = document.createElement("div");
            head.className = "head";
            const user = document.createElement("span");
            user.className = "user"
            user.textContent = el.author;
            const date = document.createElement("span");
            date.className = "date";
            date.textContent =new Date(el.date).toLocaleString();
            head.appendChild(user);
            head.appendChild(date);
            // contenu va être le message
            const text = document.createElement("div");
            text.className = "text";
            text.textContent = el.text;
            //Rajoutons ces 2 parties au general
            mes_tot.appendChild(head);
            mes_tot.appendChild(text);
            //puis finalement rajoutons le a la liste des messages
            base.appendChild(mes_tot);
        });
    }
    catch (err) {
        console.error("Erreur :", err);
    }
}
loadMes();
// on fait une recharge chaque 10 secondes
setInterval(loadMes, 10000);