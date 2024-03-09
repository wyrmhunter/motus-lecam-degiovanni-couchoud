
const adresse = "http://localhost:3001";
const auth_adress = "http://localhost:5001";
const score_adress = "http://localhost:4001";

let won = false;
const notif_area = document.getElementsByClassName("motus-notif")[0];
let essais = 5;

//On fait en sorte que les boutons de déconnexion et score sont cachés
document.getElementById("logout-button").classList.add("hide");
//document.getElementById("scores-button").classList.add("hide");
const myavg = document.getElementById('my-avg');
const myfound = document.getElementById('my-found');

const welcome = document.getElementById('username_show');



//On appelle la route /word de notre serveur pour avoir le nombre de lettres et la première lettre du mot
fetch("/word").then(response => response.text()).then(data => {
    //console.log(data);
    //On tranforme le résultat en tableau
    data = data.split(",");
    length = parseInt(data[0]);
    first_letter = data[1];
    
    //on prend le champ d'input et on lui donne la longueur du mot
    let input = document.getElementsByClassName("form-input")[0];
    input.maxLength = length;

    //On crée la table
    CreateTable(length);
});

//On appelle la route /myscore de notre serveur qui elle-même appelle la route /getscore du serveur de scores pour avoir le score du joueur
function getScore(){
    fetch("/myscore").then(async response => {
        //On récupère le statut de la réponse
        if (response.status == 401) {
            //On redirige vers la page de connexion
            document.location.href = auth_adress;
            return;
        }
        
        data = JSON.parse(await response.text());
        console.log(data);
        //On ajoute les score dans myavg et myfound
        myavg.innerHTML = data['avg_try'];
        myfound.innerHTML = data['found'];

    });
}
getScore();

function CreateTable( length){
    //Dans la table de classe "motus-table", on créé 5 lignes de 'length' cases
    let table = document.getElementsByClassName("motus-table")[0];
    console.log(length);
    for (let i = 0; i < 5; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < length; j++) {
            let cell = document.createElement("td");
            cell.classList.add("cell");
            //si c'est la première ligne, on met la lettre du mot
            if (i == 0 && j == 0) {
                cell.innerHTML = first_letter;
            }

            console.log(cell);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

document.getElementsByClassName("form-submit")[0].addEventListener("click", function(event){
    event.preventDefault()
  });

// On créé une méthode de Post pour envoyer le mot proposé par le joueur
function sendWord() {

    //let essais = document.cookie.split("=")[1];

    //On prend la valeur de l'input
    let input = document.getElementsByClassName("form-input")[0].value;
    // si vide, on ne fait rien
    if (input == "") {
        return;
    }

    // si le nombre d'essais est à 0, on ne fait rien
    if (essais == 0) {
        //On affiche une notification
        //notif_area.innerHTML = "Nombre d'essais épuisé, réessayez demain !";
        return;
    }

    //On vide l'input
    document.getElementsByClassName("form-input")[0].value = "";

    //Si le joueur a déjà gagné, on ne fait rien
    if (won) {
        
        //on ajoute la classe "bad" à la notification
        notif_area.classList.add("notif-good");
        notif_area.classList.remove("notif-bad");
        notif_area.innerHTML = "Bravo, vous avez gagné !";
        return;
    }
    
    
    //On post le mot 
    //On post les données de connexion au serveur
    fetch('/validate', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({word: input, tries: essais})
    }).then(response => response.text()).then(data => {

        console.log(data);

        //On parse les données en JSON
        data = JSON.parse(data);
        answer = data["answer"];
        good_letters = data["good_letters"];
        misplaced_letters = data["misplaced_letters"];
        remaining = data["remaining"]; 

    




        //On met à jour le nombre d'essais
        
        
        essais = parseInt(remaining);
        //document.cookie = "essais=" + essais;
        console.log(essais);


        // On met à jour le tableau
        let table = document.getElementsByClassName("motus-table")[0];
        let row = table.children[5-essais-1];
        
        //On rempli les cases de la ligne avec le mot proposé
        for (let i = 0; i < input.length; i++) {
            let cell = row.children[i];
            cell.innerHTML = input[i];
            //Si la lettre est bonne, on la met en rouge
            if (good_letters.includes(input[i])) {
                cell.classList.add("good");
            }
            //Si la lettre est dans le mot mais pas à la bonne place, on la met en jaune
            if (misplaced_letters.includes(input[i])) {
                //on ajoute la classe .almost
                cell.classList.add("almost");
                
            }
        }


        //Si le mot est bon
        if (answer == true) {
            //On affiche une notification
            notif_area.classList.add("notif-good");
            //on enlève la classe "notif-bad" à la notification
            notif_area.classList.remove("notif-bad");
            notif_area.innerHTML = "Bravo, vous avez gagné !";
            won = true;
            //On appelle la route /getscore de notre serveur pour avoir le score du joueur
            getScore();
            return;
        }



        // pour la ligne d'en dessous, on met la première lettre du mot
        if(essais > 0){
            let row2 = table.children[5-essais];
            let cell = row2.children[0];
            cell.innerHTML = first_letter;
        }


        
        //Si le nombre d'essais est à 0
        if (essais == 0) {
            //On affiche une notification
            notif_area.classList.remove("notif-good");
            notif_area.classList.add("notif-bad");
            notif_area.innerHTML = "Nombre d'essais épuisé, réessayez demain !";
            //On appelle la route /getscore de notre serveur pour avoir le score du joueur
            getScore();
            return;
        }
    });

    
}


function logout(){
    fetch("/logout").then(response => {
        if (response.status != 200) {
            console.log("Erreur lors de la déconnexion");
        }else{
            console.log("Déconnexion réussie");
            document.location.href = auth_adress + "/";
        }
    });
}