//Imports
const express = require('express')
const app = express()
const fs = require('fs');
const cors = require('cors');
const session = require('express-session')
const redis = require('redis');
const RedisStore = require("connect-redis").default;

//Variables
const port = process.env.PORT || 4001;

const allowedOrigins = ['http://localhost:3001', 'http://localhost:5001', 'http://localhost:5001/', 'http://localhost:4001']; 
const corsOptions = {
  origin: allowedOrigins, 
  credentials: true, 
  optionsSuccessStatus: 200, 
};

// APP BEGINS

app.use(cors(corsOptions));
app.use(express.static('public'));

//On contacte le conteneur REDIS
const client = redis.createClient({
  host: '0.0.0.0', 
  port: 6379,      
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

app.set('trust proxy', 1) // trust first proxy
const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session({
  store: new RedisStore({ client: client }),
  secret: 's3Cur3',
  name: 'userSession',
  saveUninitialized: false,
  _expires: expiryDate,
  resave: false,
  cookie: { maxAge: expiryDate, secure : false, httpOnly: true, domain: 'localhost', path: '/'}
}))



// PATHS
app.listen(port, () => {
  console.log(`Score Server listening on port ${port}`)
})




//api /session qui renvoie les valeurs de la session en json
app.get('/session', (req, res) => {
  //on parse la session en json
  let session = JSON.stringify(req.session);
  //on envoie la session
  res.send(session);
})


// si l'on va sur /, on renvoie le fichier score.html
app.get('/', (req, res) => {
  console.log("score.html");
  res.sendFile(__dirname + '/public/score.html');
})

// chemin /getscore pour renvoyer le score du joueur stocké sur Redis 'users'


// chemin /setscore pour enregistrer sur Redis le score du joueur actuel


// chemin /getall pour renvoyer tous les scores des utilisateurs stockés dans 'users'
app.get('/getall', (req, res) => {
  //On récupère les scores de tous les joueurs
  client.hGetAll('users', (err, obj) => {
    //On envoie les scores
    console.log(obj);
    res.send(obj);
  });
});

app.get('/port', (req, res) => {
    res.send(port.getPortAndOS().toString());
  }
)

//On créé une route pour se déconnecter
app.get('/logout', (req, res) => {
  //On détruit la session
  req.session.destroy();
  res.redirect(auth_adress);
})



