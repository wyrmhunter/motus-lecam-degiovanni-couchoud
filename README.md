![alt text](./img/motus_logo.png)

# README - Projet Microservices
Par Léonie LE CAM, Quentin DE GIOVANNI, Matteo COUCHOUD
Dans le cadre :
- Module Microservice enseigné par Simon Gomez
- 3e année de formation d'Ingénieur à CY-TECH Cergy
- Année universitaire 2023-2024

# Description du projet

Ce projet implémente le jeu de Motus avec une architecture orientée microservices. Son but est de créer une application Motus fonctionnelle, avec : 
- Un service en charge de l'authentification
- Un service en charge du jeu
- Un service en charge de l'enregistrement des scores des joueurs

**Préréquis**
- Docker installé.

**Technologies utilisées**
- front-end :
    - html
    - js
    - css
- back-end :
    - nodejs, express (services)
    - redis (bases de données)
- déploiement :
    - docker

## Installation

Voici les étapes à suivre pour installer et lancer l'application :
- Cloner le repo Git,
- Dans le repo git cloné, se placer dans le dossier `src` et y ouvrir un terminal,
- Effectuer la commande :
    1.   `docker-compose build` puis `docker-compose up` pour générer les conteneurs de l'application,
    2. ou directement `docker-compose up`.
- Une fois la génération de l'architecture terminée, allez à l'adresse http://localhost:5001 pour accéder à l'application.

**Autres commandes**
- Pour éteindre et relancer l'application : `docker-compose restart`,
- Pour éteindre l'application : `docker-compose down`

## Utiliser l'application

La première page, celle à laquelle correspond http://localhost:5001, est la page d'inscription.
### Authentification
#### Cas 1 : Nouvel utilisateur
![alt text](./img/inscription.png)
Un nouvel utilisateur peut s'inscrire via un formulaire d'inscription.\
Une fois l'utilisateur inscrit, le formulaire de connexion s'affiche.
![alt text](./img/connexion.png)
L'utilisateur se connecte en renseignant son identifiant et mot de passe utilisé lors de l'inscription.

#### Cas 2 : Connexion à un utilisateur existant
![alt text](./img/connexion.png)
Si l'utilisateur est déjà inscrit, il peut se connecter en renseignant ses identifiants dans le formulaire de connexion.

### Jouer au Momotus™
![alt text](./img/page_jeu.png)
Une fois connecté, l'utilisateur est accueilli par la page ci-dessus. Le jeu se déroule alors comme un Motus habituel, dans lequel l'utilisateur essaye de deviner le **mot du jour** dont la première lettre est indiquée.

Chaque essai est renseigné sur la grille, avec des indications suppélementaires :
- En jaune : les lettres dans le mot du jour, mais mal placées\
![alt text](./img/lettre_jaune.png)
- En rouge : les lettre dans le mot du jour, bien placées\
![alt text](./img/lettre_rouge.png)
- Sans coloration : les lettre n'appartenant pas au mot du jour\
![alt text](./img/lettre_non.png)

L'utilisateur peut proposer un mot dans la zone de saisie comme illustré ci-dessous :\
![alt text](./img/input_proposer.png)\
Une fois le mot saisi, l'utlisateur peut appuyer sur le bouton `Proposer` pour faire une tentative.

#### Conditions de victoire/défaite
L'utilisateur :
- Gagne lorsqu'il a correctement deviné le mot du jour,\
![alt text](./img/win.png)
- Perd au bout de 5 essais infructueux.\
![alt text](./img/loose.png)


#### Affichage du score du joueur
L'affichage du score de l'utlisateur se trouve en dessous de la zone de jeu :\
![alt text](./img/affichage_score.png)

### Bouton "Se déconnecter"
Lorsque l'utilisateur souhaite se déconnecter, il peut appuyer sur le bouton `Se déconnecter` en haut à gauche de la page de jeu :\
![alt text](./img/bouton_deconnexion.png)\
L'utilisateur est ensuite renvoyé à la page d'authentification.

## Documentation technique
### Architecture microservice

L'application Motus possède l'architecture suivante :
- Une partie front-end contenant le client (authentification, jeu)
- Une partie back-end comportant :
    - Un service `Score (score_service)` connecté à sa base de données `Redis Score (redis_score)`,
    - Un service `Jeu (game_service)` gérant la boucle de jeu Motus,
    - Un service `Auth (auth_service)` gérant l'authentification des utilisateurs, connecté à sa base de données `Redis Auth (redis_auth)`

>Les 3 services et 2 bases de données sont initialisés et lancés dans leurs conteneurs docker respectifs.

![alt text](./img/architecture.png)

## Interactions entre services
### Authentification

Pour s'authentifier, l'utilisateur va envoyer ses identifiants au Serveur Authentification avec la route `/login`. Ce dernier va renvoyer un token (code d'autorisation), que le client va envoyer au Serveur Jeu avec la route `/gametoken=xxxx`.\
Le Serveur Jeu va envoyer une demande de vérification au Serveur Authentification avec la route `/token`. Si le token est correct, le Serveur Authentification va envoyer le username du joueur au Serveur Jeu, puis ce dernier va finalement envoyer au client l'autorisation de jouer. Si le token est incorrect, le Serveur Jeu va recevoir du Serveur Authentification l'information que le token est incorrect et va ensuite envoyer une nouvelle demande de login au client.

![alt text](./img/authentification.png)
### Boucle de jeu

Une fois l'utilisateur connecté, le client va effectuer une requête au Serveur Jeu pour obtenir le mot du jour avec la route `/word`. Le Serveur Jeu va ainsi envoyer le nombres de lettres et la première lettre du mot. Pour rafraîchir le score du joueur, le client envoie interroge le Serveur Jeu avec la route `/myscore`. Ce dernier envoie ensuite le username du joueur au Serveur Score via la route `/getscore?username=xxxx`. Le score du joueur est ensuite renvoyé au Serveur Jeu, puis au joueur.
La boucle du jeu Motus se déroule de la manière suivante :
- En début d'itération, l'utilisateur propose un mot qui est envoyé au Serveur Jeu avec la route /validate.
- A chaque itération, on teste si le joueur a gagné ou s'il ne dispose plus d'essais. Lorsqu'un des deux cas est **validé**, le Serveur Jeu envoie alors le nombre d'essais et l'état du jeu (victoire ou défaite du joueur) au Serveur Score avec la route `/setscore`. Le score du joueur est ensuite renvoyé au Serveur Jeu puis au client.
- En fin d'itération, le Serveur Jeu envoie les lettres bien ou mal placées, le nombre d'essais restants ainsi que le booléen qui indique si le mot proposé par le joueur correspond au mot du jour ou non.

![alt text](./img/motus_game_and_score.png)

### Déconnexion

Si l'utilisateur souhaite se déconnecter, on envoie une requête de déconnexion au Serveur Jeu avec la route `/logout`. Ce dernier envoie alors le token sauvegardé dans la session au Serveur Authentification avec la route `/logout?token=xxxx`. Le serveur Authentification notifie ensuite le serveur Jeu de la suppression du token (statut 200). Enfin, le serveur Jeu retourne la réussite de la déconnexion au client qui renvoie l'utilisateur sur la page d'authentification.

![alt text](./img/deconnexion.png)

### Points à améliorer et lacunes

Les fonctionnalités suivantes n'ont pas été implémentées/implémentées partiellement ou sont à améliorer :
- [Amélioration] Amélioration du service d'authentification : 
    - en l'état actuel, l'utilisateur doit s'inscrire PUIS se connecter pour accéder au jeu. Une piste d'amélioration serait de faire en sorte que l'utilisateur soit redirigé directement vers la page de jeu après s'être inscrit.
- [Manquant] Mise en place d'un HA PROXY
- [Manquant] Monitoring : système de logs et de métriques (Grafana Loki, Promoetheus),
- [Manquant] Authentification utilisant OpenID non implémentée,
- [Implémentation partielle] Utilisation d'un token au format JSON Web Token (JWT) pour l'authentification non implémentée :
    - En l'état actuel, l'application utilise une chaîne de caractères générée aléatoirement (méthode `generateToken()` dans `src/auth/auth.js`) pour le code d'autorisation passé dans l'URL avec la route `/game?token=xxxx`.
- [Amélioration] Ajout d'une page de score affichant les scores de tous les utilisateurs inscrits,
- [Amélioration] Utilisation plus raisonnée/suivant la norme des status (200, 401, 404...) dans les réponses données à des requêtes.

## Remerciements

* Simon Gomez pour nous avoir ouvert au domaine des microservices et pour la qualité de son enseignement.
