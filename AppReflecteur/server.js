var express = require('express');
var app = express();
var path = require('path');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
// création d'une session 
const session = require('express-session');
const bcrypt = require('bcrypt'); // pour hacher les mdp

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false ,// true seulement en HTTPS
    httpOnly: true, // empêche accés JS
    sameSite: 'lax' // anti CSRF
  }
}));
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



//envoyer les données de session pour getUser
app.get('/ses', (req,res)=>{
  if (!req.session.user){// on vérifie si session existe coté serveur
    return res.status(401).json({error: "Pas identifié "});
  }// puis on envoie user (info pas importante)
  res.json({
    user: req.session.user
  });
});

// créer nouvel utilisateur retour au format json
app.post('/signin', async (req, res) => {
  const {name, user, pwd} = req.body;
  if (!user || user.trim() === '' || !pwd || pwd === '') {
    return res.json({error: "Username et mot de passe obligatoires"});
  }
  try {
    const hash = await bcrypt.hash(pwd.trim(), 10);
    await knex('users').insert({
      'user' : user.trim(),
      'pass' : hash
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
    if(!userData){
      return res.json({error: "Pas le bon username et/ou mot de passe!"})
    }
    const match = await bcrypt.compare(pwd.trim(), userData.pass);
    if (userData && match) {
      req.session.user = userData.user; // on enregristre la session pour voir qui est connecté en mémoire !
      res.json({message: `${user} connecté(e)`});
    } else {
      res.json({error: "Pas le bon username et/ou mot de passe"});
    }
  } catch (error) {
    console.error(error); // on peut enlever ça plus tard
    res.json({error: "Erreur lors du login"});
  }
});

// afficher les messages public et aussi les privés 
app.get('/messages', async (req, res) => {
  const user = req.session.user; 
  if (!user){
    return res.status(401).json({error:"User non identifié"})
  }
  try {
    const messages = await knex('messages')
      .select('date', 'author', 'text')
      .orderBy('date', 'desc');
      const privateMsgraw = await knex ('privatemessages')
      .select('date',
        'sender as author',
        'text',
        'receiver'
      )
      .where('receiver', user);
      //rajoutons variable is private pour js 
      const privateMsg = privateMsgraw.map(m =>({
        ...m, 
        isPrivate:true
      }));
      const totMsg = [...messages, ...privateMsg];
      // trier les messages par date
      totMsg.sort((a,b) => new Date(b.date) - new Date(a.date));

    res.json(totMsg);
  } catch (error) {
    console.error(error); // on peut enlever ça plus tard
    res.json({error: "Erreur serveur lors de la recup des messages"});
  }
});

// publier un message
app.post('/post', async (req, res) => {
  const author = req.session.user;
  const text = req.body.text;
  if(!author){
    return res.status(401).json({error: "User non identifié"})
  }
  if ( !text || text.trim() === '') {
    return res.json({error: "Donnée manquante pour new message"});
  }
  try {
    // vérif de l'utilisateur d'abord
    const user = await knex('users').where('user', author).first();
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

//envoyer message privé 
app.post('/privatemessage' ,  async(req,res)=>{
  const sender = req.session.user; 
  const receiver = req.body.receiver; 
  const text = req.body.text;
  if(!sender){
    return res.status(401).json({error: "User non identifié"})
  }
  if (!text || text.trim() === '' || !receiver || receiver.trim()=== '' ) {
    return res.json({error: "Donnée manquante pour new message"});
  }
  // vérifier les 2 users 
  try{
    //vérfier sender
    const user = await knex('users').where('user',sender).first(); 
    if (!user){
      return res.json({ error: "Echec de l'authentification pour envoyer ce message"})
    }
    //verfier receiver
    const user_rec = await knex('users').where('user',receiver).first(); 
    if (!user_rec){
      return res.json({error: "Destinataire n'existe pas"})
    }
    //ajout message privé 
    await knex('privatemessages').insert({
      'sender' : sender.trim(),
      'receiver' : receiver.trim(), 
      'text' : text,
      'date': new Date()
    }); 
    res.json({message: "Message envoyé"});
} catch(error) {
    console.error(error);
    res.json({error: "Erreur serveur message privé"})
  }
});

// route pour log out afin de détruire l'id de session (côté serveur)
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({message: 'Logged out'});
  });
});


// partie connection (soit HTTP soit HTTPS)

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