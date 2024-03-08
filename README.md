![alt text](./img/motus_logo.png)

## README - Micro-service Motus
Par Léonie LE CAM, Quentin DE GIOVANNI, Matteo COUCHOUD
Dans le cadre :
- Module Microservice
- 3e année de formation d'Ingénieur à CY-TECH Cergy
- Année universitaire 2023-2024

**Description du projet**

Ce projet implémente le jeu de motus en tant que micro-service. Il s'agit d'un projet pédagogique réalisé dans le cadre d'un cours sur les micro-services.
Le but du projet est de créer une application Motus fonctionnelle, avec : 
- ses parties front/back,
- un système de scores,
- un système d'authentification.

**Architecture**

L'application Motus possède l'architecture suivante :
- Le frontend constitué d'un site web avec lequel l'utilisateur va pouvoir envoyer des requêtes
- Dans le backend, les trois serveurs Jeu, Authentification et Score vont recevoir les requêtes de l'utilisateur. Les serveurs Authentification et Score communiquent avec leurs bases de données Redis respectives.

![alt text](./img/architecture.png)

**Description des services**

Pour s'authentifier, l'utilisateur va envoyer ses identifiants au Serveur Authentification avec la route /login. Ce dernier va renvoyer un token (code d'autorisation), que le client va envoyer au Serveur Jeu avec la route /game?token=xxxx. Le Serveur Jeu va envoyer une demande de vérification au Serveur Authentification avec la route /token. Si le token est correct, le Serveur Authentification va envoyer le username du joueur au Serveur Jeu, puis ce dernier va finalement envoyer au client l'autorisation de jouer. Si le token est incorrect, le Serveur Jeu va recevoir du Serveur Authentification l'information que le token est incorrect et va ensuite envoyer une nouvelle demande de login au client.

![alt text](./img/authentification.png)

**Remerciements**

* Simon Gomez pour nous avoir ouvert au domaine des microservices et pour la qualité de son enseignement. ([https://simongomezuniv.github.io/](https://simongomezuniv.github.io/))
