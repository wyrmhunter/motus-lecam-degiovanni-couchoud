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

**Technologies utilisées**

* **Langage de programmation:** Python
* **Framework:** Flask
* **Base de données:** SQLite
* **Outils de test:** Unittests

**Fonctionnalités**

Le micro-service offre les fonctionnalités suivantes :

* **Génération d'un mot aléatoire:** Le micro-service peut générer un mot aléatoire à partir d'une liste de mots prédéfinis.
* **Vérification des propositions:** Le micro-service peut vérifier si une proposition correspond au mot secret.
* **Gestion des parties:** Le micro-service peut gérer les parties en cours, en stockant le nombre de tentatives et les lettres déjà proposées.

**Architecture**

Le micro-service est composé de plusieurs modules :

* **Module API:** Ce module expose les API RESTful pour les différentes fonctionnalités du jeu.
* **Module logique:** Ce module contient la logique du jeu, y compris la génération du mot aléatoire, la vérification des propositions et la gestion des parties.
* **Module base de données:** Ce module gère l'accès à la base de données SQLite.

**Tests**

Le micro-service est accompagné d'une série de tests unitaires qui permettent de vérifier son fonctionnement.

**Déploiement**

Le micro-service peut être déployé sur n'importe quel serveur web compatible avec Python et Flask.

**Remerciements**

* Simon Gomez pour les tutoriels sur les micro-services ([https://scholar.google.com/citations?user=QkbzPB4AAAAJ&hl=en](https://scholar.google.com/citations?user=QkbzPB4AAAAJ&hl=en))
