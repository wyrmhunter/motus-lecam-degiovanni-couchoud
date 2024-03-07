const express = require('express')
const app = express()
const fs = require('fs');
const { get } = require('http');
const { json } = require('express');
const cors = require('cors');
const redis = require('redis');
const RedisStore = require("connect-redis").default;


//Définition du port sur lequel lancer l'application 
const port = process.env.PORT || 5001;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:5001/']; 

const corsOptions = {
  origin: allowedOrigins, 
  credentials: true, 
  optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));

const session = require('express-session')




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
        
        let userExists = await client.hExists('users', user.username);
        console.log(userExists);
        if (userExists == 1) {
          console.log("User already exists");
            res.status(409).send("User already exists");
        } else {
            await client.hSet('users', user.username, user.password)
            .then(async () => {
              console.log("User created");
              //On créé une session pour l'utilisateur
              req.session.username = user.username;
              //On sauve de manière asynchrone la session
              await saveSession(req);
              res.send(201,"User created")
            });
            
            
           
        }
    });
});

//Token generation
function generateToken() {
  return Math.random().toString(36).substring(7);
}

//méthode pour enregistrer la session dans Redis
async function saveSession(req, res) {
  //On génère un token pour la session
  let token = generateToken();
  //On sauve la session dans Redis
  await client.set(token, JSON.stringify(req.session));
  
}


// Route pour se connecter
app.post('/login',(req, res) => {
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

                //On sauve de manière asynchrone la session
                await saveSession(req);

                console.log(req.session);
                //sends response
                res.status(200).send("User logged in");
            } else {
                console.log("Wrong password");
                res.status(401).send("Wrong password");
            }
        }
    });
});