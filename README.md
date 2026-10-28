# SprintPath

Application personnelle d’apprentissage adaptatif pour SQL, Python et anglais professionnel. Le programme fonctionnel est détaillé dans [PRODUCT_SPEC.md](./PRODUCT_SPEC.md).

## Architecture

- `frontend/` : PWA React + TypeScript, stockage local et mode hors connexion.
- `backend/` : API FastAPI, SQLAlchemy/SQLite, moteur de progression et adaptateur NVIDIA NIM.

## Démarrage

### Backend

```powershell
cd C:\Users\valen\Documents\apprentissage\backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

L’API est disponible sur `http://localhost:8000`, avec sa documentation sur `http://localhost:8000/docs`.

### Frontend

```powershell
cd C:\Users\valen\Documents\apprentissage\frontend
npm install
npm run dev
```

L’application est disponible sur `http://localhost:5173`.

## NVIDIA NIM

Copiez `backend/.env.example` vers `backend/.env`, renseignez `NVIDIA_API_KEY`, puis redémarrez l’API. Le fichier `.env` est ignoré par Git et chargé automatiquement au démarrage.

Configuration utilisée :

```dotenv
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=nvidia/nemotron-3.5-super-vl-120b-a12b
```

Le préfixe `nvidia/` du modèle est requis. Sans clé, le feedback local déterministe reste disponible ; les fonctions IA indisponibles renvoient une erreur explicite sans empêcher l’application de fonctionner hors connexion.

### Capacités IA

- `POST /api/ai/coach` : indice, explication ou question d’entretien, avec sortie JSON strictement validée.
- `POST /api/ai/exercises/generate` : création et persistance d’une variante pour SQL, Python ou anglais professionnel.
- Feedback enrichi après une tentative : le score et la progression restent toujours déterminés par le backend.

Les actions IA du frontend exigent une connexion et affichent un état de chargement. En mode hors connexion, le contenu local, la correction déterministe et l’historique restent disponibles.

> **Sécurité :** si une clé NVIDIA a déjà été placée dans un fichier partagé tel que `backend/.env.example`, révoquez-la et générez-en une nouvelle. Ne conservez la clé active que dans `backend/.env` ou dans un gestionnaire de secrets.

## Validation

```powershell
cd backend
.\.venv\Scripts\python -m pytest

cd ..\frontend
npm run build
npm run test
```
