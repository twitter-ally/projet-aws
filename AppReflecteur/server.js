var express = require('express');
const bodyP = require('body-parser');
var app = express();

app.use(bodyP.json());
app.use(express.static('pub'));

app.all('/', (req, res) => {
  res.sendFile(__dirname + '/pub/index.html');
}); 

app.listen(3000);