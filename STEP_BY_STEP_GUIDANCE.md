# Guidage Pas à Pas - Exercices Libres

## Problème Résolu

Le problème signalé était que lors des exercices avec les dizaines, centaines et millièmes, l'utilisateur était bloqué sans guidage pour former les nombres.

## Solution Implémentée

La phase `FreePracticePhase` a été modifiée pour guider l'utilisateur pas à pas, chiffre par chiffre, exactement comme le fait la phase `ColumnUnderstandingPhase`.

### Exemple de Fonctionnement

Pour former le nombre **123** :

1. **Étape 1 - Unité** : 
   - Le système demande de placer **3** dans la colonne des unités
   - Seule la colonne des unités est débloquée
   - Quand l'utilisateur place correctement 3, on passe à l'étape suivante

2. **Étape 2 - Dizaine** :
   - Le système demande de placer **2** dans la colonne des dizaines
   - Les colonnes unités et dizaines sont débloquées
   - Quand l'utilisateur place correctement 2, on passe à l'étape suivante

3. **Étape 3 - Centaine** :
   - Le système demande de placer **1** dans la colonne des centaines
   - Toutes les colonnes nécessaires sont débloquées
   - Quand l'utilisateur place correctement 1, le nombre est complété ✓

## Changements Techniques

### Fichier Modifié
- `src/games/counting/phases/free-practice-phase.ts`

### Fonctionnalités Ajoutées

1. **Suivi de Position** : 
   - Variable `currentPosition` pour suivre quelle colonne est en cours de remplissage
   - 0 = unité, 1 = dizaine, 2 = centaine, 3 = millième

2. **Verrouillage Progressif** :
   - Tous les rouleaux sont verrouillés au départ
   - À chaque étape, seules les colonnes jusqu'à la position actuelle sont débloquées
   - Fonction `lockAll()` pour bloquer tous les rouleaux

3. **Validation Par Colonne** :
   - `startColumn()` : Démarre le remplissage d'une colonne
   - `checkProgress()` : Vérifie si la colonne actuelle est correcte
   - `handleColumnCorrect()` : Gère la validation réussie d'une colonne
   - `nextColumn()` : Passe à la colonne suivante
   - `completeNumber()` : Appelée quand toutes les colonnes sont remplies

4. **Feedback et Instructions** :
   - Instructions claires pour chaque colonne
   - Messages de validation pour chaque chiffre correct
   - Avertissements si l'utilisateur modifie une colonne précédente

5. **Intégration Unity** :
   - Écoute des événements `CorrectValue` et `WrongValue` d'Unity
   - Avancement automatique quand Unity signale une valeur correcte
   - Support du bouton "Valider" pour avancement manuel

## Avantages

- **Apprentissage Progressif** : L'utilisateur n'est plus bloqué, il est guidé étape par étape
- **Feedback Immédiat** : Validation après chaque chiffre
- **Prévention d'Erreurs** : Impossible de modifier les colonnes déjà validées par accident
- **Cohérence** : Même approche que la phase d'apprentissage `ColumnUnderstandingPhase`

## Notes

- Les exercices libres continuent de générer des nombres aléatoires de 0 à 9999
- Le compteur de succès est maintenu pour encourager l'utilisateur
- Le bouton "Quitter" reste disponible à tout moment
- Les messages vocaux d'encouragement sont préservés
