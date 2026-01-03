# LUXURYSHOP76K - Guide de Déploiement

## Structure du Projet

```
luxuryshop76k/
├── backend/                 # API FastAPI (Python)
│   ├── server.py           # Fichier principal de l'API
│   ├── requirements.txt    # Dépendances Python
│   ├── .env                # Variables d'environnement
│   └── uploads/            # Images uploadées
│
├── frontend/               # Application React
│   ├── src/
│   │   ├── App.js         # Composant principal React
│   │   ├── App.css        # Styles personnalisés
│   │   ├── index.js       # Point d'entrée
│   │   ├── index.css      # Styles Tailwind
│   │   ├── components/ui/ # Composants Shadcn
│   │   └── lib/utils.js   # Utilitaires
│   ├── public/
│   │   ├── index.html     # Page HTML (SEO optimisé)
│   │   ├── robots.txt     # Configuration robots
│   │   └── sitemap.xml    # Sitemap pour SEO
│   ├── package.json       # Dépendances Node.js
│   ├── tailwind.config.js # Configuration Tailwind
│   └── .env               # Variables d'environnement frontend
└── README.md
```

---

## Prérequis

- **Node.js** 18+ (pour le frontend)
- **Python** 3.10+ (pour le backend)
- **MongoDB** (base de données)
- **Stripe Account** (pour les paiements)

---

## Installation Locale

### 1. Backend (FastAPI)

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
# Modifier .env avec vos propres valeurs:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=luxuryshop76k
# STRIPE_API_KEY=sk_test_...  (votre clé Stripe)

# Lancer le serveur
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend (React)

```bash
cd frontend

# Installer les dépendances
yarn install
# ou: npm install

# Configurer les variables d'environnement
# Modifier .env:
# REACT_APP_BACKEND_URL=http://localhost:8001  (URL de votre backend)

# Lancer le serveur de développement
yarn start
# ou: npm start
```

---

## Configuration des Variables d'Environnement

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=luxuryshop76k
JWT_SECRET=votre-secret-jwt-securise
STRIPE_API_KEY=sk_test_votre_cle_stripe
ADMIN_EMAIL=votre-email@example.com
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://votre-backend.com
```

---

## Déploiement en Production

### Option 1: VPS (DigitalOcean, OVH, Scaleway, etc.)

1. **Backend:**
   ```bash
   # Installer Python et pip
   sudo apt install python3 python3-pip python3-venv
   
   # Copier le dossier backend
   cd /var/www/luxuryshop76k/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Utiliser Gunicorn avec Uvicorn workers
   gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
   ```

2. **Frontend (Build):**
   ```bash
   cd frontend
   yarn build
   # Les fichiers statiques sont dans /build
   ```

3. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name votredomaine.com;
       
       # Frontend
       location / {
           root /var/www/luxuryshop76k/frontend/build;
           try_files $uri /index.html;
       }
       
       # API Backend
       location /api {
           proxy_pass http://localhost:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Uploads
       location /api/uploads {
           alias /var/www/luxuryshop76k/backend/uploads;
       }
   }
   ```

### Option 2: Services Cloud

#### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

#### Railway/Render (Backend)
- Créer un nouveau projet
- Connecter votre repo GitHub
- Définir les variables d'environnement
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### MongoDB Atlas (Database)
- Créer un cluster gratuit sur https://mongodb.com/atlas
- Récupérer l'URL de connexion
- L'ajouter dans MONGO_URL du backend

---

## Identifiants Admin

- **URL Admin:** `/admin/login`
- **Username:** `LuxuryShop76K`
- **Password:** `Amiche2710`

---

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste des produits |
| GET | `/api/products/{id}` | Détail d'un produit |
| GET | `/api/categories` | Liste des catégories |
| POST | `/api/orders` | Créer une commande |
| POST | `/api/admin/login` | Connexion admin |
| GET | `/api/admin/products` | Produits (admin) |
| POST | `/api/admin/products` | Créer produit (admin) |
| PUT | `/api/admin/products/{id}` | Modifier produit (admin) |
| DELETE | `/api/admin/products/{id}` | Supprimer produit (admin) |

---

## Stripe Configuration

1. Créer un compte sur https://stripe.com
2. Récupérer votre clé API (sk_test_... pour test, sk_live_... pour production)
3. Configurer les webhooks pour `/api/webhook/stripe`

---

## Support

- **Email:** Amicheilane2@gmail.com
- **Instagram:** @LuxuryShop76k
- **TikTok:** @LuxuryShop76k
- **Snapchat:** Luxury961x213

---

## Informations de Paiement

- **IBAN:** FR7616598000014000111984142
- **PayPal:** Amicheilane2@gmail.com
