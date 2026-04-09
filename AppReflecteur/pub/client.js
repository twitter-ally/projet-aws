let refreshInterval = null;
//moyen pour utilisateur de prouver son id
//credentials dans fecth determine si les cookies seront envoyés dans la requete donc connecté 
//fonctions qui va recuperer le user connecté de façon securisé 
// on fait une promise pour avancer la sécurité (if logged marche)
async function getUser(){
    //on renvoie que le user
    try {
        const res = await fetch('/ses',{
            credentials: 'include'
        });
        if(!res.ok) return null; 
        const data = await res.json();
        return data.user;
    }
    catch(err){
        return null; 
    }
}

// charger une des vues dynamiquement (single page via ajax)
async function loadView(path) {
    const html = await fetch(path)
        .then(res => res.text());
    document.getElementById("main").innerHTML = html;
}

// construction navbar pour que ce soit dynamique en fonction de si le user est logged in ou non
async function navbar() {
    const nav = document.getElementById("navbar");
    nav.innerHTML = "";

    const logged = await getUser();

    const btnMsg = document.createElement("a");
    btnMsg.href = "#"; // pointe vers haut de page courante pour que ce soit bien fetch qui gère les routes (SPA)
    btnMsg.textContent = "Menu";
    btnMsg.addEventListener('click', (e) => {
        e.preventDefault(); // pour ne pas faire de navigation classique
        loadMes();
    })
    nav.appendChild(btnMsg);

    if (logged) { // on peut alors écrire un nouveau msg ou log out
        const btnNewMsg = document.createElement("a");
        btnNewMsg.href = "#";
        btnNewMsg.textContent = "New message";
        btnNewMsg.addEventListener('click', (e) => {
            e.preventDefault();
            viewPostMsg();
        })
        nav.appendChild(btnNewMsg);

        const btnPrivateMsg = document.createElement("a");
        btnPrivateMsg.href = "#";
        btnPrivateMsg.textContent = "Private message";
        btnPrivateMsg.addEventListener('click', (e) => {
            e.preventDefault();
            viewPrivateMsg();
        })
        nav.appendChild(btnPrivateMsg);

        const btnLogout = document.createElement("a");
        btnLogout.href = "#";
        btnLogout.textContent = "Log out";
        btnLogout.addEventListener('click', async(e) => {
            e.preventDefault();
            // log out côté serveur (on recup la route /logout)
            await viewLogout(); // att logoout server
            // log out côté client
            await navbar(); 
            loadMes();
        })
        nav.appendChild(btnLogout);
    } else { // on peut sign in ou log in
        const btnSignin = document.createElement("a");
        btnSignin.href = "#";
        btnSignin.textContent = "Sign in";
        btnSignin.addEventListener('click', (e) => {
            e.preventDefault();
            viewSignin();
        })
        nav.appendChild(btnSignin);

        const btnLogin = document.createElement("a");
        btnLogin.href = "#";
        btnLogin.textContent = "Log in";
        btnLogin.addEventListener('click', (e) => {
            e.preventDefault();
            viewLogin();
        })
        nav.appendChild(btnLogin);
    }
}

// GESTION DES VUES

//charger les messages depuis le serveur
async function loadMes() {
    clearInterval(refreshInterval);
    await loadView('/views/messages.html');
    await quickPost();
    try {
        const res = await fetch('/messages',{
            credentials: 'include'
        });// je rajoute les cookies pour pouvoir faire req.session user 
        // si ça marche pas 
        if (res.status === 401) {
            const base = document.getElementById("messages-list");
            if (base) {
                base.innerHTML = "<p>Log in to see the messages</p>";
                return;
            }
        }
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
        // on rajoute une boucle if pour le cas oú c'est privé
        const currentUser = await getUser(); // on le met içi parce que await pas dedans boucle
        mes.forEach(el => {
            //pour chaque element on doit définir les différentes parties du message pour l'affichage 
            //1ère le message en entier ou on va avoir 2 parties
            const mes_tot = document.createElement("div");
            mes_tot.className = "message";
            // cas privé
            if (el.isPrivate){
                mes_tot.classList.add('private');
            }
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
            //cas privé
            if(el.isPrivate){
                const text_priv = document.createElement("span");
                if (currentUser && el.receiver === currentUser){
                    text_priv.textContent = "You have a private message";
                }
                head.appendChild(text_priv)
            }
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
        refreshInterval = setInterval(loadMes, 5000);
    } catch (err) {
        console.error("Erreur :", err);
    }
}
//plus besoin fonction pour recu message 
// Vue pour l'envoie d'un message privé 
async function viewPrivateMsg(){
    clearInterval(refreshInterval);
    const logged = await getUser();
    if (!logged) {
        viewLogin();
        return;
    }
    await loadView('/views/privatemessage.html');
    //je prend les données du formulaire pas les valeurs 
    const form = document.getElementById("newMsgPriv");
    const receiverInput = document.getElementById("receiver"); 
    const msgInput = document.getElementById("message"); 

    // envoyer un message
    form.addEventListener('submit', async(e)=>{
        e.preventDefault(); 
        //récuperons les valeurs 
        const receiver = receiverInput.value.trim(); 
        const msg = msgInput.value.trim(); 
        if (!receiver || !msg){
            console.log("Il manque des informations"); 
            return;
        }
        try {
            const data = await fetch('/privatemessage', {
                method:'POST', 
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    receiver: receiver,
                    text: msg
                })
            }).then(res=>res.json());
            console.log(data);
            msgInput.value= "";// reset input vide 
            setTimeout(() => loadMes(), 1000);

        } catch(err) {
            console.error(err);
        }
    });
}
// vue pour sign in (le formulaire bien envoyé avec ajax)
async function viewSignin() {
    clearInterval(refreshInterval);
    await loadView('/views/signin.html');
    // suggestion de username
    function genUsername(name) {
        return name.toLowerCase().replaceAll(" ", "_") +
               "_" + Math.floor(Math.random() * 1000);
    }
    //lors que on clique sur le bouton sugestion on utilise cette fonction 
    const sugBouton = document.getElementById("sugestion");
    sugBouton.addEventListener("click", () => {
        const name = document.getElementById("name").value;
        const sug = genUsername(name);

        document.getElementById("sugestionpos").textContent =
            "What do you think about : " + sug;

        document.getElementById("user").value = sug;
    });
    const script = document.createElement("script");
    script.src = "/f_signin.js";
    document.getElementById('content').appendChild(script);

    // view
    document.getElementById('signinForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('user').value.trim();
        const pwd = document.getElementById('pwd').value.trim();
        try {
            const data = await fetch('/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pwd })
            })
                .then(res => res.json());
            if (data.error) {
                alert(data.error); // FAIRE UN MEILLEUR AFFICHAGE ICI
                return;
            }
            setTimeout(() => viewLogin(), 1000);
        } catch (err) {
            console.error(err);
        }
    });
}

// vue pour log in (formulaire envoyé avec ajax)
async function viewLogin() {
    clearInterval(refreshInterval);
    await loadView('/views/login.html');
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('user').value.trim();
        const pwd = document.getElementById('pwd').value.trim();
        try {
            const data = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ user, pwd })
            })
                .then(res => res.json());
            if (data.error) {
                alert(data.error); // FAIRE UN MEILLEUR AFFICHAGE ICI
                return;
            }
            await navbar();
            setTimeout(() => loadMes(), 1000);
        } catch (err) {
            console.error(err);
        }
    });
}

// vue pour poster un new message (formulaire once again)
async function viewPostMsg() {
    clearInterval(refreshInterval);
    const logged = await getUser();
    if (!logged) {
        viewLogin();
        return;
    }

    await loadView('/views/newmessage.html');
    document.getElementById('newMsgForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('message').value.trim();
        if (!text) return;
        try {
            const data = await fetch('/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    text: text
                })
             })
                .then(res => res.json());
            setTimeout(() => loadMes(), 1000);
        } catch (err) {
            console.error(err);
        }
    });
}

// pour le log out
async function viewLogout() {
    clearInterval(refreshInterval);
    try {
        await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (err) {
        console.error(err);
    }
}

// pour le post de new msg en haut
async function quickPost() {
    // Afficher la zone de post rapide si connecté
const currentUserForPost = await getUser();
if (currentUserForPost) {
    const quickPost = document.getElementById('quick-post');
    quickPost.style.display = 'block'; // il était avant en invisible donc on l'affiche
    document.getElementById('quickPost').addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = document.getElementById('quick-message').value.trim();
        if (!text) return;
        try {
            const data = await fetch('/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({text})
            }).then(res => res.json());
            document.getElementById('quick-message').value = '';
            loadMes();
        } catch (err) {
            console.error(err);
        }
    });
}
}

(async () => {
    await navbar();
    loadMes();
})()