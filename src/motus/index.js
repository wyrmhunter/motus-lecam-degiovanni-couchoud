const express = require('express')
const app = express()
const fs = require('fs');
const seedrandom = require('seedrandom');
const cors = require('cors');
const { get } = require('http');
const session = require('express-session')
const redis = require('redis');
const RedisStore = require("connect-redis").default;

//Définition du port sur lequel lancer l'application 
const port = process.env.PORT || 3000;
const auth_adress = "http://localhost:5001";
const authSessionUrl = 'http://localhost:5001/session';

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:5001/']; 
const corsOptions = {
  origin: allowedOrigins, 
  credentials: true, 
  optionsSuccessStatus: 200, 
};

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


//Si la session ne comporte pas la variable username, alors on rediriige vers l'authentification
app.use((req, res, next) => {
  //console.log(req.session);
  if (!req.session.username) {
    req.session.destroy();
    res.redirect(auth_adress);
  } else {
    next();
  }
});


// Path vers le fichier de mots français :
let mots = './data/liste_francais_utf8.txt';

//On lit la liste de mots et on la stocke dans un array
let motsArray = fs.readFileSync(mots).toString().split("\n");

// On prend la date du jour
function getWordOfTheDay() {
    let date = new Date();
    let jour = date.getDate();

    // On se sert du jour comme seed pour un chiffre aléatoire
    let rng = seedrandom(jour);
    
    let index = Math.floor(rng() * motsArray.length);
    
    let mdj = motsArray[index];
    //On enlève les accents du mot
    mdj = mdj.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return mdj;
}

function wordLength() {
    //On renvoie la longueur du mot du jour et sa première lettre
    let word = getWordOfTheDay();
    length = word.length-1;
    first_letter = word[0];

    return [length, first_letter];

}

// PATHS
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


app.get('/word', (req, res) => {
  console.log("Mot du jour : "+getWordOfTheDay());
  res.send(wordLength().toString());
})


//api /session qui renvoie les valeurs de la session en json
app.get('/session', (req, res) => {
  console.log(req.session);
  //on parse la session en json
  let session = JSON.stringify(req.session);
  //on envoie la session
  res.send(session);
})


// si l'on va sur /, on renvoie le fichier index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

//sur /validate?word=<MOT>, on reçoit le mot proposé par le joueur et on le compare au mot du jour
app.get('/validate', (req, res) => {
    let word = req.query.word.toString();
    console.log(word);
    let wordOfTheDay = getWordOfTheDay();
    console.log(wordOfTheDay);
    //On compare lettre par lettre

    let answer = true;
    let good_letters = [];
    let misplaced_letters = [];
    
    for (let i = 0; i < word.length; i++) {
        if (word[i] == wordOfTheDay[i]) {
            good_letters.push(word[i]);
        } else {
            //On regarde si la lettre est dans le mot du jour
            if (wordOfTheDay.includes(word[i])) {
                misplaced_letters.push(word[i]);
            }
            answer = false;
        }
    }
    // On envoie une réponse JSON avec :
    // - si le mot est correct
    // - les lettre bien placées
    // - les lettres mal placées
    res.json({
        answer: answer,
         good_letters: good_letters,
          misplaced_letters: misplaced_letters
        });

})


app.get('/port', (req, res) => {
    res.send(ports.getPortAndOS().toString());
  }
)

//On créé une route pour se déconnecter
app.get('/logout', (req, res) => {
  //On détruit la session
  req.session.destroy();
  res.redirect(auth_adress);
})




