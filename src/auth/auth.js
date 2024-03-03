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
  store: new (require("session-express-redis"))({
    host: "localhost", // Replace with your Redis host
    port: 6380, // Replace with your Redis port
  }),

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
        
        let userExists = await client.hExists('users', user.username);
        console.log(userExists);
        if (userExists == 1) {
          console.log("User already exists");
            res.status(409).send("User already exists");
        } else {
            await client.hSet('users', user.username, user.password)
            .then(() => {
              console.log("User created");
              //On créé une session pour l'utilisateur
              req.session.username = user.username;
              token = generateToken();
              req.session.token = token;
              res.send(302,"User created")
            });
            
            
           
        }
    });
});

function generateToken() {
  return Math.random().toString(36).substring(7);
}


// Route pour se connecter
app.post('/login', (req, res) => {
    //On récupère le json
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    console.log("Logging in");
    req.on('end', async () => {
        //On parse le json
        let user = JSON.parse(body);
        console.log(user);
        let userExists = await client.hExists('users', user.username);
        console.log(userExists);
        if (userExists == 0) {
            console.log("User does not exist");
            res.status(401).send("User does not exist");
        } else {
            let password = await client.hGet('users', user.username);
            console.log(password);
            if (password == user.password) {
                console.log("User logged in");
                req.session.username = user.username;
                token = generateToken();
                req.session.token = token;
                res.status(302).send("User logged in");
            } else {
                console.log("Wrong password");
                res.status(401).send("Wrong password");
            }
        }
    });
});