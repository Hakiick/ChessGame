# Règles de style de code

- Pas de `any` en TypeScript — utilise des types stricts
- Pas de console.log en production — utilise un logger
- Pas de code commenté — supprime-le ou mets-le dans un issue
- Fonctions courtes et focalisées (< 50 lignes)
- Nommage explicite : pas d'abréviations cryptiques
- Imports organisés : dépendances externes d'abord, puis internes

# Mobile-First CSS

- **YOU MUST** écrire le CSS mobile en premier (sans media query)
- **YOU MUST** utiliser `min-width` pour les media queries (progressive enhancement)
- **YOU MUST NOT** utiliser `max-width` media queries sauf cas exceptionnel documenté
- **YOU MUST** utiliser `rem` ou `em` pour les tailles, jamais `px` pour le texte
- **YOU MUST** utiliser des unités logiques (`inline`, `block`) quand pertinent

# Accessibilité

- **YOU MUST** ajouter des `aria-label` sur les éléments interactifs sans texte visible
- **YOU MUST** utiliser des éléments HTML sémantiques (`nav`, `main`, `section`, `article`)
- **YOU MUST** garantir un contraste WCAG AA (4.5:1 texte normal, 3:1 grands textes)
- **YOU MUST** rendre la navigation au clavier fonctionnelle (focus visible)
- **YOU MUST** fournir des `alt` text sur toutes les images

# Performance

- Animations GPU-accelerated uniquement (`transform`, `opacity`)
- Pas de layout shift — dimensions explicites sur images et vidéos
- Lazy-loading des images hors viewport
- Code splitting et tree shaking
