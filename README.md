# Projet Docker (Full stack)

## 1. Architecture globale

Services Docker (réseau `app-net`) :

- `db` — Postgres 18 (volume `pgdata` pour la persistance)
- `api` — Spring Boot (port interne 8080)
- `webapp` — React construit par Vite, servi par Nginx
- `proxy` — Nginx reverse-proxy qui sert le front sur `/` et route l'API sur `/api/*` → `api:8080`

Schéma (simplifié):

### Architecture de production
```mermaid
graph TD;
    Utilisateur-->Reverse-Proxy;
    Reverse-Proxy-->|/*|Frontend;
    Reverse-Proxy-->|/api/*|Backend;
    Backend-->Database;
    Frontend-->Backend;
```

### Architecture de développement
```mermaid
graph TD;
    Dev[Utilisateur]-->|:5173|Frontend;
    Dev-->|:8080|Backend;
    Dev-->Proxy[Reverse Proxy];
    Proxy-->|:80|Frontend;
    Backend-->|:5432|Database;
    Frontend-->Backend
```

## 2. Commandes pour builder et lancer

En PowerShell, à la racine du repo.

- Dev (avec override: publie aussi 5173 et 5432) :
```powershell
docker-compose up --build -d
```
- Prod-like (sans override: seulement 80 exposé) :
```powershell
docker-compose -f docker-compose.yml up --build -d
```
- Arrêt :
```powershell
docker-compose down
```
- Logs utiles :
```powershell
docker-compose logs -f proxy
docker-compose logs -f api
docker-compose logs -f db
```

## 3. Endpoints API + URL frontend

- Frontend (dev): `http://localhost:5173`
- Frontend (prod-like): `http://localhost`
- API via proxy: `http://localhost/api/*`
- API directe (dev): `http://localhost:8080/api/*`

Endpoints fournis par l’API:

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Statut de l’API (`{"status":"ok"}`) |
| GET | `/api/items` | Liste des items |
| POST | `/api/items` | Crée un item. Corps: `{ "name": "<string>" }` |

Exemples rapides:
```powershell
curl http://localhost:5173/api/health
curl http://localhost:8080/api/health
curl -X POST http://localhost:5173/api/items -H "Content-Type: application/json" -d '{"name":"Demo"}'
```

## 4. Problèmes rencontrés et solutions

- Front en 5173 ne “voyait” pas l’API → les requêtes partaient en `/api/api/*` (doublon).
	- Cause: le code front construit `API_BASE + "/api/..."` et `API_BASE` valait déjà `/api`.
	- Solution: en dev, on build le front avec `VITE_API_BASE_URL = .` (valeur relative). Les fetch deviennent `./api/...` → le proxy les résout en `/api/...` sans doublon.
- Différence dev/prod peu claire (deux URLs qui marchent).
	- Choix: en dev, on expose à la fois `80:80` et `5173:80` sur le `proxy` pour le confort. En prod-like, seul `80:80` est exposé.
- Accès DB depuis l’hôte en dev.
	- Ajout dans l’override: `db` publie `5432:5432`. Connexion: `localhost:5432` avec les variables `POSTGRES_*`.
- Rédacrion du Dockerfile front multi-stage pour builder l'application React avec Node.js puis servir les fichiers statiques avec Nginx.
	- Apres quelques essais, le dockerfile a été amelioré afin qu'il soit fonctionnel et optimisé grace a la separation des phases build et runtime, avec la partie node et la partie nginx.
## 5. Choix techniques effectués

- Docker Compose (réseau `app-net`): orchestre localement les services (`db`, `api`, `webapp`, `proxy`), isole chaque service, fournit un DNS interne par nom de service et un routage privé fiable.
- Volume `pgdata`: persiste les données Postgres entre redémarrages, autorise la recréation des conteneurs sans perte d’état et facilite les sauvegardes locales.
- Séparation dev/prod via `docker-compose.override.yml`: en dev, expose des ports pratiques (p. ex. `5173`, `5432`) pour travailler depuis l’hôte; en prod-like, limite l’exposition au strict nécessaire (`80:80`).
- Healthchecks Compose: vérifient l’état réel des services, permettent un démarrage ordonné via `depends_on: condition: service_healthy` et rendent `up`/`restart` plus robustes.
- Images taguées localement (`backend:1.0`, `frontend:1.0`): versions explicites, rollback simplifié et builds/pulls maîtrisés.
- Configuration Nginx: `proxy_pass` vers `api:8080` sur le réseau interne, propagation des en-têtes `X-Forwarded-*`, service des fichiers statiques et possibilité d’activer gzip/cache pour de meilleures performances.

## 6. Variables d’environnement principales

| Variable | Où | Description |
|----------|----|-------------|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `db` | Identifiants Postgres |
| `SPRING_DATASOURCE_URL` | `api` | `jdbc:postgresql://db:5432/<DB>` |
| `SPRING_DATASOURCE_USERNAME` | `api` | Utilisateur DB |
| `SPRING_DATASOURCE_PASSWORD` | `api` | Mot de passe DB |
| `VITE_API_BASE_URL` | `webapp` | Valeur `.` en dev; proxifié en `/api` par Nginx |

## 7. Tests rapides (copier/coller)

```powershell
# Front
start http://localhost:5173
start http://localhost

# API via proxy et directe
curl http://localhost:5173/api/health
curl http://localhost:8080/api/health

# DB (psql)
psql -h localhost -p 5432 -U $env:POSTGRES_USER -d $env:POSTGRES_DB
```
