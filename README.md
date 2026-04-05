On a le fichier db_init.js pour créer la base de données en local.
Il faut écrire dans le terminal en étant placé dans le dépôt AppReflecteur :
`node db_init.js`

En étant placé dans AppReflecteur/, lancer la commande :
`openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout private-key.pem -out certificate.pem`
afin de créer un auto-certificat pour HTTPS pour garantir le bon fonctionnement du HTTPS en localhost