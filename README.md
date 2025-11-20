# Projet Docker

## 1. Architecture globale

Le projet est composé de trois parties principales :

1. Base de données `PostgreSQL` (service `db` dans `docker-compose.yml`).
2. API REST `Spring Boot` (service `api`) exposant des endpoints pour gérer des items et vérifier la santé du système.
3. Frontend `React + Vite` (dossier `webapp`) consommant l'API. En développement il tourne via le serveur Vite (port 5173). Une configuration Nginx (`webapp/nginx.conf`) est fournie pour un déploiement statique.

Réseau interne : l'API communique avec Postgres via le nom de service Docker `db`. La persistance des données est assurée par un volume Docker `pgdata`.

## 2. Commandes pour builder et lancer

### Backend + Base de données

Se placer dans le dossier `spring-api` (là où se trouve `docker-compose.yml`).

```powershell
cd spring-api
docker compose --env-file .env up -d --build
```

Arrêter et supprimer les conteneurs :

```powershell
docker compose down
```

Voir les logs :

```powershell
docker compose logs -f api
docker compose logs -f db
```

Rebuilder uniquement l'image backend si nécessaire :

```powershell
docker compose build api
```



## 3. Endpoints API

Port backend par défaut : `8080` (configurable via `HOST_PORT` dans `.env`).

| Méthode | Endpoint | Description | Corps attendu |
|---------|----------|-------------|---------------|
| GET | `/api/health` | Vérifie la santé de l'API | - |
| GET | `/api/items` | Liste tous les items | - |
| POST | `/api/items` | Crée un nouvel item | `{"name": "<string>"}` |

Réponse `POST /api/items` : l'item créé (JSON).



## 4. Problèmes rencontrés & solutions



## 5. Choix techniques & raisons

Uniquement côté Docker du backend :

- Multi-stage Dockerfile: utilisation de `maven:3.9.9-eclipse-temurin-23-alpine` pour builder puis `eclipse-temurin:23-jre-alpine` pour exécuter. Réduit la taille finale et sépare build/runtime pour plus de sécurité.
- Caching Maven: copie de `pom.xml` avant `src/` afin de réutiliser le cache des dépendances entre builds quand le code change peu.
- Build sans tests dans l'image: `-DskipTests` pour accélérer le build d'image; les tests se lancent hors image.
- Lancement simple: `CMD ["java", "-jar", "app.jar"]` avec `EXPOSE 8080` pour documenter le port interne.
- Configuration par variables d'environnement: l'image ne contient pas de secrets; `SPRING_DATASOURCE_*` sont injectées via Compose.
- Orchestration Compose: service `api` dépend de `db` (`depends_on`), port publié configurable via `HOST_PORT`, et `restart: unless-stopped` pour la résilience locale.
- Tag d'image explicite `backend:1.0`: facilite l'identification et le versionnement local.



## 6. Variables d'environnement principales (`spring-api/.env`)

| Variable | Description | Exemple |
|----------|------------|---------|
| `POSTGRES_USER` | Utilisateur DB | `user` |
| `POSTGRES_PASSWORD` | Mot de passe DB | `password` |
| `POSTGRES_DB` | Nom base | `db` |
| `SPRING_DATASOURCE_URL` | URL JDBC | `jdbc:postgresql://db:5432/db` |
| `SPRING_DATASOURCE_USERNAME` | User JDBC | `user` |
| `SPRING_DATASOURCE_PASSWORD` | Password JDBC | `password` |
| `HOST_PORT` | Port publié pour l'API | `8080` |

## 7. Données initiales

Le fichier `data.sql` (si rempli) est exécuté au démarrage pour insérer des données dans la base.

## 8. Tests rapides des endpoints

```powershell
curl http://localhost:8080/api/health
curl http://localhost:8080/api/items
curl -X POST http://localhost:8080/api/items -H "Content-Type: application/json" -d '{"name":"Test"}'
```