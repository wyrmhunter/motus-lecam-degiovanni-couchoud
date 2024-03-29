//Imports
const express = require('express')
const app = express()
const cors = require('cors');
const redis = require('redis');

//Variables
const port = process.env.PORT || 4001;

const allowedOrigins = ['http://game_service:3001', 'http://auth_service:5001', 'http://score_service:4001']; 
const corsOptions = {
  origin: allowedOrigins, 
  credentials: true, 
  optionsSuccessStatus: 200, 
};

// APP BEGINS

app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());

//On contacte le conteneur REDIS
const client = redis.createClient({
  socket :{
    host: 'redis_score',
    port: 6379
  }     
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
  if(username==undefined || username=="undefined"){
    res.send("No user connected");
    return;
  }
  console.log("Searching score for : "+username);

  //Si la clé n'existe pas, on va créer un score par défaut 0,0
  if(await client.exists('score-'+username)==0){
    console.log("Creating score registry for : "+username);
    await client.hSet('score-'+username, 'avg_try',0);
    await client.hSet('score-'+username, 'found',0);
  }


  //On récupère le score du joueur actuel
  avg_try= await client.hGet('score-'+username,'avg_try');
  found =  await client.hGet('score-'+username,'found');
  console.log("Score found for "+username+" : "+avg_try+" "+found);
  //On renvoie le score du joueur actuel
  res.send({'avg_try':parseFloat(avg_try), 'found':parseInt(found)});
});

// chemin /setscore pour enregistrer sur Redis le score du joueur actuel
app.post('/setscore', async(req, res) => {
  //On récupère le json de la requête POST
  let prop = req.body;
  console.log(prop);
  console.log("Setting score");
  
  let username = prop.username;
  let try_today = 5 - parseInt(prop.tries);
  console.log("Try today : "+try_today);
      
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
  let old_try = await client.hGet('score-'+username,'avg_try');
  let old_found =  await client.hGet('score-'+username,'found');

  //On calcule la moyenne des essais
  let avg_try = (parseFloat(old_try)*parseInt(old_found) + try_today)/(parseInt(old_found)+1);
  //On arrondit la moyenne à 2 chiffres après la virgule
  avg_try = Math.round(avg_try*100)/100;

  //On incrémente le nombre de mots trouvés
  let found = parseInt(old_found)+1;


  console.log("Updating score for "+username+" : "+avg_try+" "+found);
  //On enregistre le score du joueur actuel
  await client.hSet('score-'+username, 'avg_try',avg_try);
  await client.hSet('score-'+username, 'found',found);

  res.send("Score updated for "+username);

});



app.get('/port', (req, res) => {
    res.send(port.getPortAndOS().toString());
  }
)



