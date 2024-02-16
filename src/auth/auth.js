const express = require('express')
const app = express()
const fs = require('fs');
const { get } = require('http');
const { json } = require('express');


//Définition du port sur lequel lancer l'application 
const port = process.env.PORT || 5001;



const session = require('express-session')
const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 's3Cur3',
  name: 'sessionId',
  _expires: expiryDate,

}))
  

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/auth.html');
})


// PATHS
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Route pour obtenir toutes les variables de session
app.get('/session', (req, res) => {
    var sessionVariables = req.session;
    console.log(sessionVariables);
    res.json(sessionVariables);
  });



  
//On contacte le conteneur REDIS
const redis = require('redis');
// Configuration de la connexion à Redis
const client = redis.createClient({
  host: '0.0.0.0', 
  port: 6380,      
});

(async () => {
  //On attend que la connexion soit établie
  await client.connect();
})();

console.log("Attempting to connect to redis");
client.on('connect', () => {
    console.log('Connected!');
});

// Log any error that may occur to the console
client.on("error", (err) => {
    console.log(`Error:${err}`);
});



// Route pour s'enregistrer
app.get('/register', (req, res) => {
  let username = "maurice";
  let password = "1234";
  

  //On cherche si l'username est déjà pris
  client.hGetAll(username, function(err, obj) {
    if (obj) {
      res.json({error: "Username already taken"});
    } else {
      //On enregistre le nouvel utilisateur
      client.hSet(username, {password: password}, function(err, reply) {
        if (reply) {
          res.json({success: "User created"});
        } else {
          res.json({error: "Error creating user"});
        }
      });

    }
  }
  );
  

});