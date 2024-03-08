//Imports
const express = require('express')
const app = express()
const cors = require('cors');
const redis = require('redis');

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
  host: '0.0.0.0', //redis_score
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




// PATHS
app.listen(port, () => {
  console.log(`Score Server listening on port ${port}`)
})




// si l'on va sur /, on renvoie le fichier score.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/score.html');
})

// chemin /getscore pour renvoyer le score du joueur stocké sur Redis 'users'
app.get('/getscore',  async (req, res) => {

  //On récupère le nom du joueur actuel dans l'url
  let username = req.query.username;
  console.log(username);
  //Si l'utilisateur n'est pas connecté, on ne renvoie rien
  if(username==undefined){
    res.send("No user connected");
    return;
  }
  console.log("Searching score for : "+username);
  //On récupère le score du joueur actuel
  avg_try= await client.hGet('score-'+username,'avg_try');
  found =  await client.hGet('score-'+username,'found');
  //On renvoie le score du joueur actuel
  res.send({'avg_try':avg_try, 'found':found});
});

// chemin /setscore pour enregistrer sur Redis le score du joueur actuel
app.post('/setscore', async(req, res) => {
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
    let username = prop.username;
    let try_today = prop.tries+1; //empêche d'avoir 0 essais - Correction d'une erreur dans la requête
      
    //Si le score du joueur n'existe pas, on le crée
    if(await client.exists('score-'+username)==0){

      console.log("Creating score registry for : "+username);
      await client.hSet('score-'+username, 'avg_try',try_today);
      await client.hSet('score-'+username, 'found',1);
      res.send("Score created");
      return;

    }

    //Dans le cas où le score du joueur existe déjà, on le met à jour
    //On récupère le score du joueur actuel
    let old_try= await client.hGet('score-'+username,'avg_try');
    let old_found =  await client.hGet('score-'+username,'found');

    //On calcule la moyenne des essais
    let avg_try = (old_try*old_found + try_today)/(old_found+1);
    //On arrondit la moyenne à 2 chiffres après la virgule
    avg_try = Math.round(avg_try*100)/100;

    //On incrémente le nombre de mots trouvés
    let found = parseInt(old_found)+1;


    
    //On enregistre le score du joueur actuel
    await client.hSet('score-'+username, 'avg_try',avg_try);
    await client.hSet('score-'+username, 'found',found);

    res.send("Score updated for "+username);
  });
});



app.get('/port', (req, res) => {
    res.send(port.getPortAndOS().toString());
  }
)



