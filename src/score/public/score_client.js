const auth_adress = "http://localhost:5001";
const game_adress = "http://localhost:3001";
const score_adress = "http://localhost:4001";

const myavg = document.getElementById('my-avg');
const myfound = document.getElementById('my-found');





//On appelle la route /getscore de notre serveur pour avoir le score du joueur
fetch(score_adress+"/getscore").then(response => response.text()).then(data => {
    data = JSON.parse(data);
    console.log(data);
    //On ajoute les score dans myavg et myfound
    myavg.innerHTML = data['avg_try'];
    myfound.innerHTML = data['found'];

});





function logout(){
    fetch(auth_adress+"/logout").then(response => {
        if (response.status != 200) {
            console.log("Erreur lors de la déconnexion");
        }else{
            console.log("Déconnexion réussie");
            document.location.href = auth_adress + "/";
        }
    });
}

function game(){
    document.location.href = game_adress + "/";
}


function login(){
    document.location.href = auth_adress + "/";
}