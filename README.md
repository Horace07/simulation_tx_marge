# Simulation de TVA et de marge

Cette application fournit deux scénarios de calcul pour simuler des ventes avec TVA, marge
brute et impôt sur les sociétés :

1. **Prix d'achat + prix de vente** : le prix de vente HT est renseigné et sert de base pour
   déterminer TVA, marge et résultat net.
2. **Prix d'achat + marge cible** : une marge cible est définie en pourcentage du prix de
   vente. L'application calcule automatiquement le prix de vente HT nécessaire pour l'atteindre.

## Formules utilisées

Tous les montants renseignés sont supposés **hors taxes (HT)**.

- `TVA = Prix de vente HT × taux TVA`
- `Prix de vente TTC = Prix de vente HT + TVA`
- `Marge brute = Prix de vente HT − Prix d'achat HT`
- `Marge brute % = Marge brute ÷ Prix de vente HT`
- `Bénéfice imposable = max(Marge brute, 0)`
- `Impôt sur les sociétés = Bénéfice imposable × taux IS`
- `Autres contributions = Bénéfice imposable × taux additionnel`
- `Résultat net = Bénéfice imposable − Impôt sur les sociétés − Autres contributions`

Dans le scénario « marge cible », le prix de vente HT est calculé avec la formule :

- `Prix de vente HT = Prix d'achat HT ÷ (1 − taux de marge cible)`

## Hypothèses fiscales

- Les taux par défaut sont : **TVA 20 %**, **impôt sur les sociétés 25 %** et aucune
  contribution supplémentaire.
- Les autres contributions éventuelles (CET, participation, etc.) peuvent être saisies comme
  un pourcentage du bénéfice imposable.
- Aucun amortissement, charge fixe ou crédit de taxe n'est pris en compte.

## Lancer la simulation

Aucun backend n'est requis. Ouvrez simplement `public/index.html` dans un navigateur moderne
ou servez le dossier `public/` via un serveur statique.

Pour lancer quelques scénarios de vérification depuis Node.js :

```bash
npm run test:scenarios
```

Le script affiche deux jeux de paramètres (prix de vente connu et marge cible) avec les
résultats détaillés.

## Structure du projet

- `public/modules/simulator.js` : moteur de calcul réutilisable côté client ou côté serveur.
- `public/` : application web minimale pour la saisie des données et l'affichage des
  résultats.
- `scripts/run_scenarios.js` : tests manuels de cohérence des formules.
