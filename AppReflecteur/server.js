var express = require('express');
const bodyP = require('body-parser');
var app = express();
const path = require('path'); 
app.use(bodyP.json());
app.use(express.static('pub'));


app.use(express.static(path.join(__dirname, "pub")));
app.get("/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signin.html"));
});
app.get("/newmessage", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "newmessage.html"));
});
app.get("/messages", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "messages.html"));
});
app.listen(3000);