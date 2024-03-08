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
const port = process.env.PORT || 3001;
const auth_adress = "http://localhost:5001";
const authSessionUrl = 'http://localhost:5001/session';
const score_adress = "http://localhost:4001";

const allowedOrigins = ['http://localhost:3001', 'http://localhost:5001', 'http://localhost:5001/', 'http://localhost:4001']; 
const corsOptions = {
  origin: allowedOrigins, 
  credentials: true, 
  optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));
app.use(express.static('public'));

//On contacte le conteneur REDIS
const client = redis.createClient({
  host: '0.0.0.0', //redis_score
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
app.get('/', (req, res,next) => {
   //console.log(req.session);
   if (!req.session.username) {
    req.session.destroy();
    res.redirect(auth_adress);
  } else {
    res.sendFile(__dirname + '/public/index.html');
    next();
  }
})

//sur /validate?word=<MOT>, on reçoit le mot proposé par le joueur et on le compare au mot du jour
app.post('/validate', async (req, res) => {
  //On récupère le json
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  console.log("Validating word");
  req.on('end', async () => {
    //On parse le json
    let prop = JSON.parse(body);
    console.log(prop);
    let word = prop.word;
    let tries = prop.tries;
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
    remaining = tries - 1;
    let username = req.session.username;

    //Si answer est troujours true alors on a gagné, si remaining est à 0 alors on a perdu
    if (answer == true || remaining == 0) {
      //On envoie au serveur de score le nombre d'essais 'tries' + l'utilisateur pour qu'il le stocke
      await fetch(score_adress + '/setscore', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username,tries: tries})
      }).then(response => {
        if (response.status != 200) {
            console.log("Erreur lors de l'envoi du score");
        }else{
            console.log("Score envoyé");
        }
      });
    }

    // On envoie une réponse JSON avec :
    // - si le mot est correct
    // - les lettre bien placées
    // - les lettres mal placées
    res.json({
      answer: answer,
      good_letters: good_letters,
      misplaced_letters: misplaced_letters,
      remaining: remaining
    });
  });

})


app.get('/port', (req, res) => {
    res.send(port.getPortAndOS().toString());
  }
)


//route score pour passer le username du joueur dans l'url
app.get('/myscore', (req, res) => {
  //On demande au serveur score.js d'appeler /getscore avec le username du joueur
  score = res.redirect(score_adress+"/getscore?username="+req.session.username);
  console.log(score);
  //on récupère la réponse du serveur score.js
  res.send(score);
})


