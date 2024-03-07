const auth_adress = "http://localhost:5001";
const game_adress = "http://localhost:3001";
const score_adress = "http://localhost:4001";


//Si le joueur est déjà connecté, on laisse les boutons de déconnexion et retour au jeu visibles
fetch(score_adress+"/session").then(response => response.text()).then(data => {
    data = JSON.parse(data);
    console.log(data);
    if (data["username"] != undefined) {
        //On affiche le nom du joueur
        document.getElementById("logout-button").classList.remove("hide");
        document.getElementById("game-button").classList.remove("hide");
        document.getElementById("username_show").innerHTML = "Bonjour " + data["username"] +" !";
    }
    else{
        document.getElementById("login-button").classList.remove("hide"); 
    }
});


//On appelle /getall pour récupérer tous les scores
fetch(score_adress+"/getall").then(response => response.text()).then(data => {
    data = JSON.parse(data);
    console.log(data);
    
});



function logout(){
    fetch(score_adress+"/logout").then(response => {
        console.log("Déconnexion réussie");
        document.location.href = auth_adress;
    });
}

function game(){
    document.location.href = game_adress + "/";
}


function login(){
    document.location.href = auth_adress + "/";
}