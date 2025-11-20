# Projet Final - Stack Spring Boot / Frontend JS / PostgreSQL

> Utilisez ce fichier pour écrire la documentation en remplaçant le contenu par le vôtre.  
> N'oubliez pas de préciser la composition de l'équipe dans ce fichier.

## Objectif du projet final

Assembler et exécuter une **application web complète** composée de trois services :

* **Backend :** API REST Spring Boot
* **Frontend :** application React ou Vue
* **Base de données :** PostgreSQL

L’objectif est de conteneuriser chaque service, les orchestrer avec **Docker Compose**, et garantir la persistance des données ainsi que la bonne communication entre les services.

---

## Tâches à réaliser

1. Écrire les `Dockerfile` pour le backend (multi-stage) et le frontend (build + Nginx).
   - Chaque dossier contiendra son propre `Dockerfile`.
2. Créer le fichier `.env` pour les secrets.
3. Écrire le `docker-compose.yml` complet (API, Web, DB).
4. Tester le bon fonctionnement de la stack :
   * API accessible sur `localhost:8080`
   * Frontend sur `localhost:8081`
   * Persistance PostgreSQL via volume.
5. Ecrire une documentation claire et précise.

---

## Tests et validation

<p></p>

1️⃣ Lancer la stack :

```bash
docker compose up -d --build
```

2️⃣ Vérifier que tout fonctionne :

* Backend disponible sur [http://localhost:8080](http://localhost:8080)
* Frontend disponible sur [http://localhost:8081](http://localhost:8081)
* PostgreSQL persistant via le volume `pgdata`

3️⃣ Consulter les logs si besoin :

```bash
docker compose logs -f
```

---

## Bonus (optionnel)

<p></p>

💡 Pour aller plus loin :

* Ajouter un **service pgAdmin** pour visualiser la base.
* Ajouter un **reverse proxy Nginx** entre le frontend et le backend.
* Configurer une **intégration CI/CD** pour tester et builder la stack automatiquement.

> Notifier les bonus effectués dans la documentation.


