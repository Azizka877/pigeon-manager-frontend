README.md — Pigeon Manager Frontend (Web)

# Pigeon Manager Frontend

Application web de gestion de colombier pour éleveurs de pigeons voyageurs. Développée avec **Next.js 16**, **React 19**, **Tailwind CSS v4** et **shadcn/ui**.

🔗 **URL de production** : [https://pigeon-manager-frontend.vercel.app](https://pigeon-manager-frontend.vercel.app)

---

## 🖥️ Fonctionnalités

| Module | Description |
|--------|-------------|
| **Dashboard** | Vue d'ensemble du colombier, statistiques, accès rapide |
| **Pigeons** | Liste complète, fiche détail (infos, généalogie, palmarès, santé), CRUD |
| **Cages** | Grille visuelle, détail avec occupation, historique, actions |
| **Couples** | Formation et gestion des couples reproducteurs |
| **Reproductions** | Suivi des saisons de reproduction, pontes, éclosions |
| **Sorties** | Déclaration des sorties (vente, décès, perte) |
| **Profil** | Informations utilisateur, paramètres |

---

## 🏗️ Architecture








---

## 🚀 Installation & Lancement

### Prérequis
- Node.js ≥ 20
- npm ou pnpm

### Installation

```bash
git clone https://github.com/Azizka877/pigeon-manager-frontend.git
cd frontend
npm install


Variables d'environnement
Crée un fichier .env.local :
NEXT_PUBLIC_API_URL=https://pigeon-manager-back.onrender.com/api

Lancer en développement
npm run dev
Ouvre http://localhost:3000

Build production

npm run build
npm start

Déploiement
Vercel (recommandé)

npm install -g vercel
vercel --prod
Ou via GitHub :
Connecte le repo à Vercel
Variable d'environnement : NEXT_PUBLIC_API_URL
Déploiement automatique sur chaque push


🔧 Stack Technique

| Technologie         | Usage                            |
| ------------------- | -------------------------------- |
| **Next.js 16**      | Framework React (App Router)     |
| **React 19**        | UI library                       |
| **TypeScript 5**    | Typage statique                  |
| **Tailwind CSS v4** | Utility-first CSS                |
| **shadcn/ui**       | Composants UI (Radix + Tailwind) |
| **React Query v5**  | Data fetching, cache, mutations  |
| **Zustand**         | State management                 |
| **Axios**           | HTTP client                      |
| **Lucide React**    | Icônes                           |
| **Sonner**          | Notifications toast              |


🔐 Authentification
JWT Access/Refresh tokens
Interceptors Axios pour renouvellement automatique
localStorage pour persistance
Middleware Next.js pour protection des routes
🎨 Design System
shadcn/ui : composants accessibles et personnalisables
Tailwind CSS v4 : styling utility-first
Lucide : icônes cohérentes
Sonner : toasts élégants
Thème clair/sombre avec next-themes
🌐 API Backend
URL : https://pigeon-manager-back.onrender.com/api
Tech : Django REST Framework
Auth : JWT (SimpleJWT)
Endpoints : pigeons, cages, couples, reproductions, sorties, users




👤 Auteur
Abdoul Aziz KA — @Azizka877