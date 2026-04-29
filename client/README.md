# VTC Moto - Système de Gestion

Une application web moderne pour la gestion d'une flotte de motos VTC avec interface d'administration complète.

## 🚀 Fonctionnalités

- **Dashboard** avec statistiques et métriques en temps réel
- **Gestion des Motards** - CRUD complet avec upload de permis
- **Gestion des Motos** - CRUD complet avec upload de photos et carte grise
- **Gestion des Clients** - CRUD complet avec système de blocage
- **Gestion des Admins** - Système d'authentification et autorisation
- **Interface responsive** avec design moderne

## 🛠️ Technologies

### Frontend
- React 18 avec TypeScript
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- Context API pour la gestion d'état

### Backend
- Node.js avec Express
- PostgreSQL pour la base de données
- JWT pour l'authentification
- Multer pour l'upload de fichiers
- bcryptjs pour le hachage des mots de passe

## 📦 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- PostgreSQL
- npm ou yarn

### Configuration de la base de données

1. Créez une base de données PostgreSQL nommée `admin`
2. Exécutez les scripts SQL pour créer les tables :

```sql
-- Table Moto
CREATE TABLE Moto (
    Matricule VARCHAR(20) PRIMARY KEY,
    Modele VARCHAR(50),
    Couleur VARCHAR(30),
    Type VARCHAR(30),
    CarteGrise BYTEA,
    PhotoMoto BYTEA
);

-- Table Client
CREATE TABLE Client (
    NumTel VARCHAR(20) PRIMARY KEY,
    NomComplet VARCHAR(50),
    StatusBloque BOOLEAN DEFAULT FALSE
);

-- Table Motard
CREATE TABLE Motard (
    NumTel VARCHAR(20) PRIMARY KEY,
    NomComplet VARCHAR(50),
    StatutBloque BOOLEAN DEFAULT FALSE,
    MatriculeMoto VARCHAR(20),
    DateNaiss DATE,
    PermisCond BYTEA,
    FOREIGN KEY (MatriculeMoto) REFERENCES Moto(Matricule)
);

-- Table Admin
CREATE TABLE Admin (
    NumTel VARCHAR(20) PRIMARY KEY,
    NomComplet VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    MDP VARCHAR(100),
    Type VARCHAR(30) CHECK (
        Type IN ('AdminChauffeur', 'AdminStatistique', 'AdminReclamations', 'AdminGestion')
    ),
    CHECK (Email ~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$')
);
```

### Installation des dépendances

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd server
npm install
```

### Configuration de l'environnement

Créez un fichier `.env` dans le dossier `server` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=admin
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Lancement de l'application

#### Backend
```bash
cd server
npm run dev
```

#### Frontend
```bash
npm run dev
```

## 🔑 Authentification

Pour tester l'application, créez un admin dans la base de données :

```sql
INSERT INTO Admin (NumTel, NomComplet, Email, MDP, Type) VALUES 
('0123456789', 'Admin Test', 'admin@vtcmoto.com', '$2b$10$hash_of_admin123', 'AdminGestion');
```

**Comptes de test :**
- Email: admin@vtcmoto.com
- Mot de passe: admin123

## 🏗️ Structure du projet

```
/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Layout/
│   │   ├── Motards/
│   │   ├── Motos/
│   │   └── Clients/
│   ├── contexts/
│   ├── services/
│   └── App.tsx
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── server.js
└── package.json
```

## 📱 Interface utilisateur

L'application dispose d'une interface moderne avec :
- Sidebar de navigation avec icônes
- Header avec recherche et notifications
- Tableaux interactifs pour la gestion des données
- Formulaires modals pour l'ajout/modification
- Système de cartes pour l'affichage des motos
- Dashboard avec statistiques visuelles

## 🔐 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Validation des emails
- Protection des routes API
- Upload sécurisé des fichiers

## 📊 API Endpoints

### Authentication
- `POST /api/admins/login` - Connexion admin

### Motards
- `GET /api/motards` - Liste des motards
- `POST /api/motards` - Créer un motard
- `PUT /api/motards/:id` - Modifier un motard
- `DELETE /api/motards/:id` - Supprimer un motard

### Motos
- `GET /api/motos` - Liste des motos
- `POST /api/motos` - Créer une moto
- `PUT /api/motos/:id` - Modifier une moto
- `DELETE /api/motos/:id` - Supprimer une moto

### Clients
- `GET /api/clients` - Liste des clients
- `POST /api/clients` - Créer un client
- `PUT /api/clients/:id` - Modifier un client
- `DELETE /api/clients/:id` - Supprimer un client

### Dashboard
- `GET /api/dashboard/stats` - Statistiques générales
- `GET /api/dashboard/activity` - Activité récente

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT.