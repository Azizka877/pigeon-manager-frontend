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


















Volière ultra-réaliste — vraies photos de pigeons dans les cages
Les cages sont de vraies petites scènes vectorielles dessinées finement, et les
pigeons sont des vraies photos détourées posées sur le perchoir — avec un
pigeon en vol qui atterrit sur le faîte des toits :

Porte visible à l'avant : cadre clair, barreaux internes, 2 gonds à
gauche, loquet métallique à droite, plaque laiton rivetée gravée du
numéro de la cage. Cage occupée → porte entrouverte ; elle s'ouvre encore
plus au survol (pivot autour du gond).
Structure réaliste : toit à double pente avec faîte et bardeaux, fascia,
façade grillagée (barreaux verticaux + barres traversantes), treillis
visible à l'arrière, perchoir en bois avec supports, abreuvoir accroché au
barreau, paille au sol, nichoir en bois pour les couples, tiroir de
propreté avec poignée, 2 pieds, ombre portée.
Banque de 7 vraies photos (dossier public/) :
perchoir mâles : pigeon-perche.png, pigeon-perche-2.png,
pigeon-perche-4.png (bleu-gris barré ×2 + foncé checké) ;
perchoir femelles : pigeon-perche-3.png (fauve avec bague d'élevage) +
pigeon-perche-2.png ;
faîte du toit : pigeon-vol.png, pigeon-vol-a.png, pigeon-vol-b.png
(atterrissage ailes déployées).
Chaque pigeon reçoit sa photo par hash stable de son id (le même pigeon
garde toujours la même image), femelles sur la banque fauve, mâles sur les
gris — et jamais deux clones identiques face à face dans un couple.
Animations conservées : les photos respirent (échelle verticale
subtile, pattes ancrées au perchoir) et se penchent quand on survole
leur cage ; la porte s'entrouvre encore plus au survol.
Couleurs par cage : 8 teintes réalistes (craie, anthracite, sauge,
terracotta, ardoise, miel, bordeaux, sable) attribuées par hash stable de
l'id → la même cage garde toujours la même couleur.
Sémantique métier inchangée : badge vert « Libre », rouge « Occupée »,
orange « Couple », clic → setSelectedCage(cage.id) (le store stocke l'id
string, le CageDetailSheet fonctionne comme avant), matricules et
« depuis le … » sous la scène.
Installation
lib/cage-art.ts → copier dans frontend/lib/cage-art.ts
(aucune dépendance : fonctions pures qui génèrent le SVG).
lib/pigeon-cage-images.ts (NOUVEAU) → copier dans
frontend/lib/pigeon-cage-images.ts. C'est la banque de photos : elle
choisit l'image de chaque pigeon selon son id et son sexe, et garantit
deux images différentes dans un couple.
components/cages/cage-card.tsx → remplacer votre
frontend/components/cages/cage-card.tsx.
L'API est conservée : <CageCard cage={cage} isSelected={...} />,
clic → setSelectedCage(cage.id) (✅ corrige l'erreur TS2345
« Argument of type 'Cage' is not assignable to parameter of type
'string' » — le store attend l'id, pas l'objet), getStatusConfig
reste exporté.
⚠️ Types : le fichier définit sa propre interface Cage. Si votre
projet en a déjà une (dans types/ ou lib/api/client.ts), importez-la
et supprimez la définition locale.
globals.css-bloc-a-ajouter.css → coller tout le contenu à la fin de
frontend/app/globals.css (respiration, porte, survol). Déjà fait si
vous l'aviez collé lors de la précédente livraison — rien de nouveau.
public/ → copier les 7 PNG dans frontend/public/
(pigeon-perche.png, pigeon-perche-2.png, pigeon-perche-3.png,
pigeon-perche-4.png, pigeon-vol.png, pigeon-vol-a.png,
pigeon-vol-b.png). Les 2 premiers y sont normalement déjà.
Ajouter vos propres photos
Détourer une photo (PNG fond transparent), l'optimiser (hauteur ≈ 512 px)
et la déposer dans frontend/public/.
Ajouter une entrée dans la banque adaptée de
lib/pigeon-cage-images.ts :
ts
{ href: '/ma-photo.png', face: 'droite', ratio: 0.95 }
face : sens du regard sur la photo ('gauche' ou 'droite') —
le miroir n'est appliqué par la scène que si nécessaire ;
ratio : largeur ÷ hauteur de l'image (pour un rendu à la bonne
proportion).
Détail technique
Les pigeons sont injectés comme <image href="/pigeon-*.png"> dans le SVG :
une seule requête HTTP par image (cache navigateur) quel que soit le nombre
de cages affichées.
preserveAspectRatio="xMidYMax meet" + ancrage bas → les pattes de la photo
touchent toujours le perchoir, quelle que soit la proportion de l'image.
Ombres : disque doux sur le fond de cage derrière chaque pigeon + ombre au
sol sous le perchoir → les photos sont « dans » la cage, pas collées dessus.
Repli automatique : pas d'id de pigeon, pas de photo dans la banque ou
typePigeon: 'dessin' → retour des pigeons vectoriels dessinés (mâle
bleu-gris barré à cou irisé, femelle fauve). Aucune cage vide, aucun trou.
Faîte occupé : 1 couple sur 3 reçoit un pigeon en vol (hash de l'id cage) ;
forçable avec pigeonSurToit: true.
Les ids SVG sont préfixés par un hash de l'id de cage → aucune collision de
gradients même avec 50 cages affichées.
prefers-reduced-motion est respecté (animations coupées).
Personnalisation rapide :
couleurs → tableau PALETTE_CAGES dans lib/cage-art.ts ;
taille des pigeons → hauteurs passées à placerPhotoPigeon
(48 pour un seul, 44/46 pour un couple) ;
amplitude de l'ouverture de porte → classes .pm-porte-ouverte dans le
bloc CSS.