//GESTION DE LA CONNEXION/INSCRIPTION - PAGE D'ACCUEIL

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginButton = document.getElementById('showLoginForm');
    const registerButton = document.getElementById('showRegisterForm');
    
    loginButton.addEventListener('click', () => {
      loginForm.classList.remove('hide');
      registerForm.classList.add('hide');
    });
  
    registerButton.addEventListener('click', () => {
      loginForm.classList.add('hide');
      registerForm.classList.remove('hide');
    });
  
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      login();
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        register();
    });

    

  });

const adresse = "http://localhost:5001";
const game_adress = "http://localhost:3001";
const score_adress = "http://localhost:4001";
const notif_area = document.getElementById("notif-area");

//Fonction pour se connecter
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    //On clear les champs de connexion
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    //On post les données de connexion au serveur
    fetch('/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    // On attend la réponse du serveur
    .then(async response => {
        if (response.status == 200) {
            //notification
            notif_area.classList.remove("notif-bad");
            notif_area.classList.add("notif-good");
            notif_area.innerHTML = "Connexion réussie";
            console.log("Connexion réussie");
            //On récupère le token renvoyé par le serveur
            let actoken = await response.text();
            console.log(actoken);

            //On redirige vers la page de jeu avec le token
            document.location.href = game_adress + "/game?token=" + actoken;

        } else {
            //notification
            notif_area.classList.remove("notif-good");
            notif_area.classList.add("notif-bad");
            notif_area.innerHTML = "Identifiants incorrects";
            console.log("User not found");
        }
    })
  

    
}

//Fonction pour s'inscrire
function register() {
    let username = document.getElementById('newUsername').value;
    console.log(username);
    let password = document.getElementById('newPassword').value;
    console.log(password);
    //On clear les champs d'inscription
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';

    //On post les données d'inscription au serveur
    fetch('/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        if (response.status == 201 ) {
            console.log("User created");
            //notification
            notif_area.classList.remove("notif-bad");
            notif_area.classList.add("notif-good");
            notif_area.innerHTML = "Inscription réussie";
            //On réactive le formulaire de connexion
            document.getElementById('loginForm').classList.remove('hide');
            document.getElementById('registerForm').classList.add('hide');

        } else {
            console.log("User already exists");
        }
    })

}

