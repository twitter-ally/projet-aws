var express = require('express');
const bodyP = require('body-parser');
var app = express();

app.use(bodyP.json());
app.use(express.static('pub'));

// Nunjucks
const consolidate=require('consolidate');
app.engine('html',consolidate.nunjucks);
app.set('view engine', 'nunjucks');

app.all('/', (req, res) => {
  res.sendFile(__dirname + '/pub/index.html');
}); 

// pour créer un nouvel utilisateur
// à voir comment accéder à la page de signin
app.post('/signin', (req, res) => {
  // pour l'instant on affiche pour débuggage
  const name = req.query.name;
  const pwd = req.query.pwd;
  console.log(name + " " + pwd);

  res.render('messages.html', { 'name' : name, 'pwd' : pwd }); // on envoie les credentials à la page générale
});

app.listen(3000);