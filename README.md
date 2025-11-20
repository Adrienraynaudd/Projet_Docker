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

### Frontend (mode développement)

```powershell
cd webapp
npm install
npm run dev   # lance Vite sur http://localhost:5173
```

### Build frontend (production statique)

```powershell
cd webapp
npm run build  # génère dist/
```

Déploiement nginx (exemple de Dockerfile si besoin) :

```Dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
```

Build & run (exemple) :

```powershell
docker build -t webapp:1.0 webapp
docker run -d -p 80:80 webapp:1.0
```

## 3. Endpoints API & URL frontend

Port backend par défaut : `8080` (configurable via `HOST_PORT` dans `.env`).

| Méthode | Endpoint | Description | Corps attendu |
|---------|----------|-------------|---------------|
| GET | `/api/health` | Vérifie la santé de l'API | - |
| GET | `/api/items` | Liste tous les items | - |
| POST | `/api/items` | Crée un nouvel item | `{"name": "<string>"}` |

Réponse `POST /api/items` : l'item créé (JSON).

URL frontend dev : `http://localhost:5173`.

Pour configurer l'URL de l'API côté frontend, créer un fichier `.env` dans `webapp` si nécessaire :

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 4. Problèmes rencontrés & solutions

| Problème | Cause | Solution appliquée |
|----------|-------|--------------------|
| Communication API ↔ DB en conteneurs | Hostname incorrect | Utilisation du nom de service `db` dans `SPRING_DATASOURCE_URL` (`jdbc:postgresql://db:5432/db`). |
| CORS entre frontend (5173) et backend (8080) | Navigateur bloque requêtes cross-origin | Ajout de `@CrossOrigin(origins = "*")` dans les controllers Spring. |
| Persistance des données | Données perdues après `docker compose down` | Volume nommé `pgdata` monté sur `/var/lib/postgresql/data`. |
| Configuration des credentials | Dur codage risqué | Centralisation dans le fichier `.env` consommé par Compose. |
| Évolution du schéma | Changements de modèle JPA | `spring.jpa.hibernate.ddl-auto=update` pour simplifier en développement (à remplacer par migrations en prod). |
| Port conflit local | Port 8080 occupé | Variable `HOST_PORT` pour remapper (`HOST_PORT=8090` par ex.). |

Vous pouvez compléter / ajuster cette table avec les problèmes réellement rencontrés.

## 5. Choix techniques & raisons

| Choix | Raison |
|-------|-------|
| PostgreSQL | Base relationnelle robuste, image officielle légère (`alpine`). |
| Spring Boot | Rapidité de développement REST, intégration JPA/Hibernate, simplicité de config. |
| JPA/Hibernate | Gestion ORM et génération de schéma automatique en dev. |
| Docker Compose | Orchestration locale simple multi-services, isolation et reproductibilité. |
| Variables d'environnement (.env) | Séparation configuration / code, facilité de changement sans rebuild. |
| React + Vite | Démarrage rapide, HMR performant, build optimisé. |
| Nginx pour statique | Serveur léger, configuration simple pour SPA (fallback vers `index.html`). |
| `@CrossOrigin(*)` | Rapidité de prototypage; à restreindre en production pour sécurité. |
| Volume Postgres | Persistance des données entre redémarrages. |
| `ddl-auto=update` (dev) | Simplifier itérations modèle; à remplacer par Flyway ou Liquibase en production. |

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

Le fichier `data.sql` (si rempli) est exécuté au démarrage pour insérer des données dans la base. (Compléter selon vos besoins.)

## 8. Tests rapides des endpoints

```powershell
curl http://localhost:8080/api/health
curl http://localhost:8080/api/items
curl -X POST http://localhost:8080/api/items -H "Content-Type: application/json" -d '{"name":"Test"}'
```

## 9. Améliorations possibles

- Ajouter un Dockerfile frontend automatisé (exemple fourni).
- Restreindre CORS aux origines autorisées.
- Ajouter Flyway / Liquibase pour la gestion des migrations.
- Mettre en place des tests unitaires et d'intégration (JUnit / Testcontainers).
- Ajouter une CI (GitHub Actions) pour build et tests.

---
Complétez les sections Problèmes & Données initiales si d'autres points spécifiques ont été rencontrés.