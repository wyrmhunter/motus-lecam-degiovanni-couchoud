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
const game_adress = "http://localhost:3000";


//Fonction pour se connecter
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    //On clear les champs de connexion
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    //On post les données de connexion au serveur
    fetch(adresse + '/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    // On attend la réponse du serveur
    .then(response => {
        if (response.status == 200 || response.status == 201) {

        } else {
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
    fetch(adresse + '/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        if (response.status == 201) {
            console.log("User created");
            login();
        } else {
            console.log("User already exists");
        }
    })

}