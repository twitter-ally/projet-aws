var express = require('express');
var app = express();

app.use(express.json())
app.use(express.static('pub'));

// DB
var knex = require('knex')({
   client: 'sqlite3',
   connection: {
       filename: "./db.sqlite3"
   },
   debug: true,
});

/** ------------------------------------------------------ */
// AJOUTER LES CODES DE STATUTS POUR LES RENDUS JSON ????

// redirection après le json gérée côté client

// ajouter de l'échappement de texte sur les points d'entrée + chiffrement mdp

app.all('/', (req, res) => {
  res.sendFile(__dirname + '/pub/index.html');
});

// créer nouvel utilisateur retour au format json
app.post('/signin', async (req, res) => {
  const {user, pwd} = req.body;
  if (!user || user.trim() === '' || !pwd || pwd === '') {
    return res.json({error: "Username et mot de passe obligatoires"});
  }
  try {
      await knex('users').insert({
        'user' : user.trim(),
        'pass' : pwd.trim()
      });
      res.json({message: "Compte créé"});
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
  const {user, pwd} = req.body;
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
        'text' : text.trim()
      });
    res.json({message: "Nouveau message posté"});
  } catch (error) {
    console.error(error); // peut être supprimé
    res.json({error: "Erreur serveur new message"});
  }
});

app.listen(3000);