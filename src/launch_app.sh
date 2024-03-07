#Script pour lancer le déploiement total de l'application motus
#Pour simplifier les tests

#On lance les scripts index.js, score.js et auth.js dans chacun de leurs répertoires respectifs
#!/bin/bash

# Définissez les noms des fichiers
fichiers=(motus/index.js auth/auth.js score/score.js)

# Fonction pour lancer une commande node dans un terminal séparé
function lancer_node() {
  fichier="$1"
  echo "Lancement de 'node $fichier'..."
  exec node "$fichier" &
}

# Lancez la fonction pour chaque fichier
for fichier in "${fichiers[@]}"
do
  lancer_node "$fichier"
done

# Affiche un message de confirmation
echo "**Commandes 'node' lancées pour les fichiers :**"
echo "${fichiers[@]}"