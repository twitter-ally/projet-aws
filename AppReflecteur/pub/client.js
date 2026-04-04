// récup le user s'il est connecté
function getUser() {
    const user = sessionStorage.getItem('user');
    const pwd = sessionStorage.getItem('pwd');
    if (user && pwd) {
        return {user, pwd};
    }
    return null;
}

// charger une des vues dynamiquement (single page via ajax)
async function loadView(path) {
    const html = await fetch(path)
        .then(res => res.text());
    document.getElementById("main").innerHTML = html;
}

// construction navbar pour que ce soit dynamique en fonction de si le user est logged in ou non
function navbar() {
    const nav = document.getElementById("navbar");
    nav.innerHTML = "";

    const logged = getUser();

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

        const btnLogout = document.createElement("a");
        btnLogout.href = "#";
        btnLogout.textContent = "Log out";
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('pwd');
            navbar();
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
    await loadView('/views/messages.html');
    try {
        const res = await fetch('/messages');
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

// vue pour sign in (le formulaire bien envoyé avec ajax)
async function viewSignin() {
    await loadView('/views/signin.html');
    // suggestion de username
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
            setTimeout(() => viewLogin(), 2000);
        } catch (err) {
            console.error(err);
        }
    });
}

// vue pour log in (formulaire envoyé avec ajax)
async function viewLogin() {
    await loadView('/views/login.html');
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('user').value.trim();
        const pwd = document.getElementById('pwd').value.trim();
        try {
            const data = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pwd })
            })
                .then(res => res.json());
            sessionStorage.setItem('user', user);
            sessionStorage.setItem('pwd', pwd);
            navbar();
            setTimeout(() => loadMes(), 2000);
        } catch (err) {
            console.error(err);
        }
    });
}

// vue pour poster un new message (formulaire once again)
async function viewPostMsg() {
    const logged = getUser();
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
                body: JSON.stringify({
                    author: logged.user,
                    pwd: logged.pwd,
                    text: text
                })
             })
                .then(res => res.json());
            setTimeout(() => loadMes(), 2000);
        } catch (err) {
            console.error(err);
        }
    });
}

navbar();
loadMes();
// on fait une recharge chaque 10 secondes
//setInterval(loadMes, 10000);