# Connexion EMSI Univora

## Lancer

Depuis la racine du dépôt, dans PowerShell :

```powershell
cd frontend
npm.cmd ci
# Facultatif : l’URL ci-dessous est déjà la valeur par défaut.
$env:NEXT_PUBLIC_API_URL = "http://localhost:8085/api/v1"
npm.cmd run dev
```

Ouvrir http://localhost:3000/login. Si ce port est occupé, utiliser celui indiqué par Next.js. Une configuration persistante peut être placée dans `.env.local` à partir de `.env.example`.

Le backend doit répondre sur `POST /api/v1/auth/login` et `GET /api/v1/auth/me`. Le backend doit être configuré et lancé ; les changements ultérieurs du module planning sont décrits dans [le rapport d’intégration](../docs/analysis/integration-planning-2026-11-11.md).

## Vérifier

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run start -- --port 3001
```

Ouvrir http://localhost:3001/login pour vérifier le build de production. `NEXT_PUBLIC_API_URL` est intégré au bundle pendant le build ; le définir avant de compiler si le backend utilise une autre URL.

Scénarios à vérifier avec un backend de développement : formulaire vide, mauvais identifiants, serveur arrêté, affichage du mot de passe, envoi au clavier, état de chargement, connexion réussie et déconnexion. Tester la case « Se souvenir de moi », le rechargement, la taille mobile et le réglage système de réduction des animations.

Les contrôles automatisés locaux sous `.taste-skill/` utilisent des réponses API synthétiques interceptées dans un navigateur Chromium. Ils ne valident pas le backend réel et n’introduisent aucun compte dans la base.

Validation effectuée : lint sans avertissement, build de production réussi, 22 contrôles navigateur réussis (dont les erreurs, le chargement, les stockages, l’expiration, la déconnexion, le clavier, le zoom 200 % et la réduction des animations). Rendu vérifié à 1440, 768, 390 et 375 px, ainsi qu’en paysage à 844 × 390. L’inspecteur visuel relève 0 échec ; son avertissement sur la proportion de vert est accepté car le panneau de marque vert foncé est expressément demandé. Le texte rouge sur le fond du résumé d’erreur atteint un contraste calculé de 4,60:1.

## Design et animations

- Skills utilisés : Design Taste Frontend et UI/UX Pro Max. Direction tirée : `editorial-greeting`, graine `69806438`, avec palette et typographie conservées. Le cadrage « connexion » remplace les blocs de données du modèle : aucun indicateur ou contenu métier fictif.
- La structure à deux panneaux, le vert de marque, les labels flottants et les entrées progressives suivent le brief utilisateur ; ils priment sur les recommandations génériques du skill pour les tableaux de bord.
- Le réseau du logo devient le motif du panneau de marque. Logo horizontal extrait de la référence fournie, variante blanche et icône carrée dans `public/brand/`. Aucun logo n’a été redessiné par IA.
- Couleurs réutilisables dans `globals.css` et `@theme inline` de Tailwind 4 : `emsi-green`, `emsi-green-dark`, `emsi-anthracite`, `emsi-red`. Le vert foncé est utilisé pour les boutons et liens afin de conserver un contraste lisible avec le blanc. Le rouge est réservé aux erreurs de l’interface ; le point rouge du logo d’origine est conservé.
- Geist est conservée. Sur ordinateur : panneau de marque de 45 % et espace formulaire de 55 %. Sous 1024 px : logo et formulaire dans une seule colonne. Aucun dégradé ou effet de verre ajouté.
- Animations en CSS, démarrées après le montage de la page : aucun package ajouté. Entrée latérale de la carte et apparition progressive des éléments sur 600 ms, avec stagger de 60 ms ; transitions de 200–300 ms et secousse d’erreur de 400 ms. Le réseau se déplace et ses nœuds pulsent pendant 4,8 s, puis s’arrêtent. Le bouton « Rejouer l’animation » permet de revoir le mouvement. `prefers-reduced-motion` désactive toutes les animations et transitions et affiche « Animations réduites » ; le texte de chargement reste affiché et annoncé.
- Adaptation à la hauteur disponible au zoom navigateur 100 % : espacements compacts sous 740 px de hauteur, avec dimensions de saisie et de boutons accessibles. Vérification sans débordement ni défilement en état initial à 1366 × 650, 1366 × 768, 1280 × 600, 375 × 667 et 390 × 844. Aucun zoom CSS imposé et aucun défilement bloqué : les erreurs et le texte agrandi peuvent naturellement allonger la page.
- Labels associés, erreurs liées par `aria-describedby`, résumé d’erreurs focalisé, bouton de visibilité nommé, autocomplétion et gestionnaires de mots de passe autorisés, focus visible et absence de blocage du collage.
- « Mot de passe oublié ? » est volontairement visuel et marqué indisponible, sans faux lien. L’aide indique de contacter la scolarité.

## Authentification et stockage

Le formulaire réutilise et étend `ApiClient`. Le JSON envoyé contient uniquement `username` et `password`. Le token est conservé sous la clé existante `emsi_auth_token`, accompagné de son expiration :

- Case décochée, par défaut : `sessionStorage`, limité à la session de l’onglet.
- Case cochée : `localStorage`, persistant entre les ouvertures du navigateur, jusqu’à expiration.

Les deux stockages restent accessibles au JavaScript et donc exposés en cas de XSS. **Un cookie `HttpOnly`, `Secure`, `SameSite` serait préférable pour le token**, avec adaptation du serveur ou mise en place d’une couche serveur Next.js (BFF), puis traitement adapté du CSRF. Cette évolution n’est pas simulée avec un cookie JavaScript, qui ne pourrait pas être `HttpOnly`.

Le mot de passe et le profil ne sont pas persistés. Les erreurs HTTP, réseau et délai sont distinguées ; aucun message technique brut du backend n’est affiché. Délai de requête : 15 secondes.

Après connexion, le responsable planning est dirigé vers `/timetable`, les autres rôles vers `/dashboard`. Ce dernier charge le profil depuis `/auth/me` avec le token Bearer et affiche le nom, le rôle en français et le campus si disponible. Un token absent ou expiré, ou une réponse 401/403, renvoie vers `/login`. Cette garde d’interface ne remplace pas l’autorisation côté backend. La déconnexion supprime les données locales ; elle ne prétend pas révoquer un JWT côté serveur.

## Fichiers livrés

Créés :

- `src/app/login/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/auth/brand-panel.tsx`
- `src/components/auth/login-form.tsx`
- `src/components/auth/login-motion.tsx`
- `src/components/auth/dashboard-session.tsx`
- `src/components/ui/text-field.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/icon.tsx`
- `src/lib/auth.ts`
- `public/brand/univora-horizontal.png`
- `public/brand/univora-horizontal-white.png`
- `public/brand/univora-icon.png`
- `.env.example`
- `LOGIN.md`

Modifiés :

- `src/lib/api-client.ts` : token temporaire ou persistant, expiration, erreurs typées et délai de requête.
- `src/app/globals.css` : thème, composants, responsive et animations.
- `src/app/layout.tsx` : langue française, métadonnées et icône Univora.
- `src/app/api/health/route.ts` : retrait d’une variable inutilisée pour un lint sans avertissement.

La connexion utilise des animations CSS sans dépendance dédiée. L’intégration planning ajoute ensuite Lucide, des polices Geist locales et le packaging standalone conditionnel pour Docker ; voir le rapport d’intégration. Les scripts, captures et rapports de contrôle visuel sont conservés dans `.taste-skill/` à la racine du dépôt.
