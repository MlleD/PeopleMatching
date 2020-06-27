### Mise en place avec WAMPSERVER64
1. Lancer WAMPSERVER64, et attendre que tous les services soient ouverts.
2. Se mettre dans le dossier du projet.
3. Ecrire dans un terminal node router.js

### Mise en place sous Ubuntu
1. Vérifier que les paquets suivants sont installés : express,  country-list
Sinon les installer avec la commande : npm install -latest (nom_du_paquet)
2. Se mettre dans le dossier PeopleMatching
3. Créer la base de données MySQL PeopleMatching
4. Remplir cete BDD avec les scripts SQL présents dans le dossier db :
Utiliser la commande "sudo mysql PeopleMatching < db/<nom_du_fichier>" (sans les chevrons) 
5. Lancer le serveur MySQL en écrivant la commande sudo mysql
6. Lancer le serveur NodeJS en écrivant la commande node router.js