var express = require('express');
var app = express();
var path = require('path');
app.use(express.json())
app.use(express.static('pub'));
app.use(express.urlencoded({ extended: true }));
// DB
var knex = require('knex')({
   client: 'sqlite3',
   connection: {
       filename: "./db.sqlite3"
   },
   useNullAsDefault: true // pour remplir les colonnes qui manquent , ça me donne un warning
});
/**
 * Direction fichiers
 */
app.all('/', (req, res) => {
  res.sendFile(__dirname + '/pub/index.html');
});
app.use(express.static(path.join(__dirname, "pub")));

/** ------------------------------------------------------ */

// ajouter de l'échappement de texte sur les points d'entrée + chiffrement mdp



// créer nouvel utilisateur retour au format json
app.post('/signin', async (req, res) => {
  const {name, user, pwd} = req.body;
  if (!user || user.trim() === '' || !pwd || pwd === '') {
    return res.json({error: "Username et mot de passe obligatoires"});
  }
  try {
      await knex('users').insert({
        'user' : user.trim(),
        'pass' : pwd.trim()
      });
      res.json({message: "Utilisateur créé"});
    } catch (error) {
      console.error(error); // on peut enlever ça plus tard
      if (error.message.includes('UNIQUE')) {
        return res.json({error: "Username déjà utilisé"});
      }
      res.json({error: "Erreur lors du signin"});
    }
});

// login d'un utilisateur
app.post('/login', async (req, res) => {
  const {name, user , pwd} = req.body;
  if (!user || !pwd) {
    return res.json({error: "Username et mot de passe obligatoires"});
  }
  try {
    const userData = await knex('users')
      .select('user', 'pass')
      .where('user', user.trim())
      .first();
    if (userData && userData.pass === pwd.trim()) {
      res.json({message: `${user} connecté(e)`});
    } else {
      res.json({error: "Pas le bon username et/ou mot de passe"});
    }
  } catch (error) {
    console.error(error); // on peut enlever ça plus tard
    res.json({error: "Erreur lors du login"});
  }
});

// afficher les messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await knex('messages')
      .select('date', 'author', 'text')
      .orderBy('date', 'desc');
    res.json(messages);
  } catch (error) {
    console.error(error); // on peut enlever ça plus tard
    res.json({error: "Erreur serveur lors de la recup des messages"});
  }
});

// publier un message
app.post('/post', async (req, res) => {
  const author = req.body.author;
  const text = req.body.text;
  const pwd = req.body.pwd;
  if (!author || author.trim() === '' || !text || text.trim() === '') {
    return res.json({error: "Donnée manquante pour new message"});
  }
  try {
    // vérif de l'utilisateur d'abord
    const user = await knex('users').where('user', author).first();
    if (!user || user.pass !== pwd) {
      return res.json({ error: "Echec de l'authentification pour new message" });
    }
    // ajout du msg ensuite
    await knex('messages').insert({ // la date est automatique par défaut
        'author' : author.trim(),
        'text' : text
      });
    res.json({message: "Nouveau message posté"});
  } catch (error) {
    console.error(error); // peut être supprimé
    res.json({error: "Erreur serveur new message"});
  }
});

const https = require('node:https');
const fs = require('node:fs');
if (fs.existsSync('private-key.pem') && fs.existsSync('certificate.pem')) {
  const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem')
  };
  https.createServer(options, app).listen(3000, () => {
    console.log("Serveur HTTPS lancé sur https://localhost:3000");
  });
} else {
  app.listen(3000, () => {
    console.log("Serveur HTTP lancé sur http://localhost:3000");
    console.log("Pour activer HTTPS, générer le certificat depuis AppReflecteur/ avec :");
    console.log("openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout private-key.pem -out certificate.pem");
  });
}