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
  
    // Ajoutez le code pour gérer les soumissions de formulaires ici
  });

const adresse = "http://localhost:5001";
  

//Fonction pour se connecter
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    //On post les données de connexion au serveur
    fetch(adresse + '/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })

    
}

//Fonction pour s'inscrire
function register() {
    let username = document.getElementById('newUsername').value;
    console.log(username);
    let password = document.getElementById('newPassword').value;
    console.log(password);

    //On post les données d'inscription au serveur

    fetch(adresse + '/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })

}