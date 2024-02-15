const express = require('express')
const app = express()
const fs = require('fs');
const seedrandom = require('seedrandom');
const { get } = require('http');

//on importe ./API/ports.js
const { ports } = require('./API/port.js');

//Définition du port sur lequel lancer l'application 
const port = process.env.PORT || 3000;
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
  res.send(wordLength().toString());
})

app.use(express.static('public'));

// si l'on va sur /motus, on renvoie le fichier index.html
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
