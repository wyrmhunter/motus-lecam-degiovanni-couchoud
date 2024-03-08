const express = require('express')
const app = express()
const fs = require('fs');
const { get } = require('http');
const { json } = require('express');
const cors = require('cors');
const redis = require('redis');


//Définition du port sur lequel lancer l'application 
const port = process.env.PORT || 5001;

const allowedOrigins = ['http://localhost:3001', 'http://localhost:5001', 'http://localhost:5001/', 'http://localhost:4001']; 
const auth_adress = "http://localhost:5001";
const corsOptions = {
  origin: allowedOrigins, 
  credentials: true, 
  optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded());

const session = require('express-session')
app.use(express.static('public'));

//On contacte le conteneur REDIS
const client = redis.createClient({
  host: '0.0.0.0', //redis_auth 
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
const expirytime =  60*60*1000;
const sessionMiddleWare = session({
  store: new session.MemoryStore,
  secret: 's3Cur3',
  name: 'authSession',
  saveUninitialized: false,
  _expires: expirytime,
  resave: false,
  cookie: { maxAge: expirytime, secure : false, httpOnly: true, domain: 'localhost', path: '/'}
});


app.use(sessionMiddleWare);




//api /session qui renvoie les valeurs de la session en json
app.get('/session', (req, res) => {
  //on parse la session en json
  let session = JSON.stringify(req.session);
  //on envoie la session
  res.send(session);
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/auth.html');
})


// PATHS
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




  



// Route pour s'enregistrer
app.post('/register', (req, res) => {
    //On récupère le json
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    console.log("Registering user");
    req.on('end', async () => {
        //On parse le json
        let user = JSON.parse(body);
        console.log(user);
        
        let userExists = await client.exists ('user-'+ user.username);
        console.log(userExists);
        if (userExists == 1) {
          console.log("User already exists");
            res.status(409).send("User already exists");
        } else {
            await client.hSet('user-'+user.username, 'password', user.password)
            .then(async () => {
              console.log("User created");
              await client.hSet('score-'+ user.username, 'avg_try', 0);
              await client.hSet('score-'+ user.username,'found',0);
              res.send(201,"User created")
            });
        }
    });
});

//Token generation
function generateToken() {
  let token = Math.random().toString(36).substring(7);
  return token;
}




// Route pour se connecter
app.post('/login', async (req, res) => {
    //On récupère le json de la requête POST
    let user = req.body;
    console.log(user);
    let userExists = await client.exists('user-'+ user.username);
    console.log(userExists);
    if (userExists == 0) {
        console.log("User does not exist");
        res.status(401).send("User does not exist");
        return;
    } 
    
    let password = await client.hGet('user-'+user.username, 'password');
    console.log(password)
    if (password != user.password) {
      console.log("Wrong password");
      res.status(401).send("Wrong password");
      return;  
    }

    //On génère le token d'autorisation
    var actoken = generateToken();
    req.session.token = actoken;
    req.session.username = user.username;
    req.session.save( function(err) {
      if (err) {
        console.log(err);
      }
      console.log(req.session);
    });
    //On enregistre la relation token-user dans Redis
    await client.hSet('ac-'+ actoken.toString(), 'user', user.username);
    await client.expire('ac-'+ actoken.toString(), expirytime/1000);

    res.status(200).send(actoken);
    
});

//Chemin pour le logout, qui sera appelé par différents services
app.get('/logout', async(req, res) => {
  //On récupère le token envoyé dans la requête
  let token = req.query.token;
  console.log('Token to delete is : '+token);
  let response = await client.del('ac-'+token);
  if (response != 1) {
    console.log("Token not found");
    res.status(404).send("Token not found");
    return;
  } 

  //On détruit la session
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    }
  });
  res.status(200).send("Logout successful");

})


//Chemin pour vérifier si un token est valide
app.get('/token', async(req, res) => {
  //On récupère le token
  let token = req.query.token;
  console.log('Token is : '+token);
  //On interroge le serveur d'authentification pour savoir si le token correspond à un utilisateur
  let user = await client.hGet('ac-'+token, 'user');
  console.log('User is : '+user);
  if (user == null) {
    console.log("Token not valid");
    res.status(401).send("Token not valid");
  } else {
    console.log("Token valid");
    res.status(200).send(user);
  }
})

