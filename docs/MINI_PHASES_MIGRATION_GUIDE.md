# Guide de Migration: Mini-Phases

## Introduction

Ce guide explique comment migrer d'une phase monolithique vers une architecture de mini-phases, en utilisant la refactorisation de `ColumnUnderstandingPhase` comme exemple.

## Quand Utiliser les Mini-Phases?

Utilisez les mini-phases quand:
- ✅ Votre phase fait plus de 200 lignes
- ✅ Vous avez des étapes séquentielles bien définies
- ✅ Vous avez beaucoup d'instructions vocales
- ✅ La logique est difficile à tester
- ✅ Vous avez besoin de réutiliser certaines parties

N'utilisez PAS les mini-phases quand:
- ❌ Votre phase est simple (<100 lignes)
- ❌ La logique est hautement couplée
- ❌ Il n'y a pas d'étapes séquentielles claires

## Pattern de Base

### Avant: Phase Monolithique

```typescript
export class MyComplexPhase extends PhaseBase {
  private state1: string;
  private state2: number;
  private state3: boolean;
  
  async execute(): Promise<void> {
    // Étape 1
    await this.speak('Introduction...');
    this.doSomething1();
    
    // Étape 2
    await this.speak('Explication...');
    this.doSomething2();
    
    // Étape 3
    await this.speak('Conclusion...');
    this.doSomething3();
    
    this.complete();
  }
  
  private doSomething1() { /* 50 lignes */ }
  private doSomething2() { /* 80 lignes */ }
  private doSomething3() { /* 60 lignes */ }
}
```

### Après: Architecture Mini-Phases

```typescript
// Fichier principal: my-complex-phase.ts
export class MyComplexPhase extends SequencePhase {
  constructor() {
    super('my-complex', buildPhases(), 'Ma Phase Complexe');
  }
}

function buildPhases(): PhaseBase[] {
  return [
    new IntroPhase(),
    new Step1Phase(),
    new Step2Phase(),
    new ConclusionPhase()
  ];
}

// Fichier: mini-phases/intro-phase.ts
class IntroPhase extends PhaseBase {
  async execute(): Promise<void> {
    await this.speak('Introduction...');
    this.complete();
  }
}

// Fichier: mini-phases/step1-phase.ts
class Step1Phase extends PhaseBase {
  async execute(): Promise<void> {
    await this.speak('Explication...');
    // Logique de l'étape 1
    this.complete();
  }
}

// ... et ainsi de suite
```

## Étapes de Migration

### 1. Identifier les Étapes Séquentielles

Analysez votre phase actuelle et identifiez les étapes logiques:

```typescript
// Exemple d'analyse de ColumnUnderstandingPhase
Étape 1: Introduction générale → PhaseIntroductionPhase
Étape 2: Pour chaque stage (x4):
  2a. Introduction du stage → StageIntroPhase
  2b. Pour chaque nombre (x3):
    2b1. Introduction du nombre → NumberIntroPhase
    2b2. Pour chaque colonne:
      2b2a. Remplir la colonne → ColumnFillPhase
    2b3. Célébration du nombre → NumberCompletionPhase
  2c. Célébration du stage → StageCompletionPhase
Étape 3: Conclusion générale → PhaseCompletionPhase
```

### 2. Créer la Structure de Dossiers

```bash
src/games/[your-game]/phases/
├── my-phase.ts                    # Phase principale
└── my-phase-mini/                 # Dossier pour mini-phases
    ├── index.ts                   # Exports
    ├── intro-phase.ts
    ├── step1-phase.ts
    ├── step2-phase.ts
    └── conclusion-phase.ts
```

### 3. Extraire les Messages Vocaux

Créez une liste de tous les messages vocaux et groupez-les par mini-phase:

```typescript
// Avant (tout dans une phase)
await this.speak('Message 1');
// ... 100 lignes ...
await this.speak('Message 2');
// ... 100 lignes ...
await this.speak('Message 3');

// Après (séparé par mini-phase)
// intro-phase.ts
await this.speak('Message 1');

// step1-phase.ts
await this.speak('Message 2');

// step2-phase.ts
await this.speak('Message 3');
```

### 4. Créer les Mini-Phases de Base

Commencez par les mini-phases les plus simples:

```typescript
// intro-phase.ts
import { PhaseBase } from "../../../core/phases/abstract-phase";

export class IntroPhase extends PhaseBase {
  constructor() {
    super('my-intro', 'Introduction');
  }

  async execute(): Promise<void> {
    await this.speak('Message d\'introduction');
    
    this.updateGameState({
      message: 'Introduction...'
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.complete();
  }
}
```

### 5. Créer les Mini-Phases Paramétrées

Pour les mini-phases qui se répètent avec des paramètres différents:

```typescript
export class StepPhase extends PhaseBase {
  constructor(
    private stepNumber: number,
    private stepData: string
  ) {
    super(`step-${stepNumber}`, `Étape ${stepNumber}`);
  }

  async execute(): Promise<void> {
    await this.speak(`Étape ${this.stepNumber}: ${this.stepData}`);
    
    // Logique spécifique à l'étape
    
    this.complete();
  }
}
```

### 6. Créer les Mini-Phases Composées

Pour orchestrer d'autres mini-phases, utilisez `SequencePhase`:

```typescript
import { SequencePhase } from "../../../core/phases/sequence-phase";

export class ComplexStepPhase extends SequencePhase {
  constructor(stepNumber: number) {
    super(
      `complex-step-${stepNumber}`,
      buildComplexStepPhases(stepNumber),
      `Étape Complexe ${stepNumber}`
    );
  }
}

function buildComplexStepPhases(stepNumber: number): PhaseBase[] {
  return [
    new IntroSubPhase(stepNumber),
    new ActionSubPhase(stepNumber),
    new CompletionSubPhase(stepNumber)
  ];
}
```

### 7. Refactoriser la Phase Principale

Transformez votre phase monolithique en orchestrateur:

```typescript
export class MyPhase extends SequencePhase {
  constructor() {
    super('my-phase', buildMyPhases(), 'Ma Phase');
  }
}

function buildMyPhases(): PhaseBase[] {
  const phases: PhaseBase[] = [];
  
  // Introduction
  phases.push(new IntroPhase());
  
  // Étapes principales
  for (let i = 1; i <= 4; i++) {
    phases.push(new StepPhase(i, `Données ${i}`));
  }
  
  // Conclusion
  phases.push(new ConclusionPhase());
  
  return phases;
}
```

### 8. Gérer l'État Partagé

Si vos mini-phases ont besoin de partager de l'état:

**Option 1: Via GameState** (Recommandé)
```typescript
// Dans step1-phase.ts
this.updateGameState({
  sharedData: 'valeur'
});

// Dans step2-phase.ts
const state = this.getGameState();
console.log(state.sharedData); // 'valeur'
```

**Option 2: Via Closure** (Pour données temporaires)
```typescript
function buildPhases(): PhaseBase[] {
  let sharedData = '';
  
  return [
    new Phase1(() => sharedData = 'nouvelle valeur'),
    new Phase2(() => console.log(sharedData))
  ];
}
```

**Option 3: Via StateManager** (Pour état global)
```typescript
// Dans une mini-phase
this.setState({ key: 'value' });
const value = this.getState().key;
```

### 9. Gérer les Événements Unity

Chaque mini-phase peut écouter les événements Unity:

```typescript
export class MyPhase extends PhaseBase {
  async execute(): Promise<void> {
    this.onUnityEvent('MyEvent', (data) => {
      console.log('Event reçu:', data);
      // Traiter l'événement
    });
    
    // La mini-phase ne se complète pas automatiquement
    // Elle attend un événement ou une condition
  }
}
```

**Important**: Les event listeners sont automatiquement nettoyés quand la phase se termine (grâce à `addCleanup`).

### 10. Tester les Mini-Phases

Chaque mini-phase peut être testée indépendamment:

```typescript
// test/mini-phases/intro-phase.test.ts
describe('IntroPhase', () => {
  it('should speak introduction message', async () => {
    const phase = new IntroPhase();
    const mockStateManager = createMockStateManager();
    
    await phase.start(mockStateManager);
    await phase.whenComplete();
    
    expect(mockStateManager.speak).toHaveBeenCalledWith('Message d\'introduction');
  });
});
```

## Patterns Avancés

### Pattern 1: Mini-Phase Conditionnelle

```typescript
function buildPhases(): PhaseBase[] {
  const phases: PhaseBase[] = [];
  
  phases.push(new IntroPhase());
  
  // Condition
  if (shouldIncludeOptionalStep()) {
    phases.push(new OptionalPhase());
  }
  
  phases.push(new ConclusionPhase());
  
  return phases;
}
```

### Pattern 2: Génération Dynamique

```typescript
function buildPhases(): PhaseBase[] {
  const phases: PhaseBase[] = [];
  
  phases.push(new IntroPhase());
  
  // Générer dynamiquement
  const items = generateItems();
  items.forEach(item => {
    phases.push(new ProcessItemPhase(item));
  });
  
  phases.push(new ConclusionPhase());
  
  return phases;
}
```

### Pattern 3: Mini-Phase Réutilisable

```typescript
// Créer une mini-phase générique
export class SpeakPhase extends PhaseBase {
  constructor(
    id: string,
    private message: string
  ) {
    super(id, 'Speak');
  }

  async execute(): Promise<void> {
    await this.speak(this.message);
    this.complete();
  }
}

// Utiliser plusieurs fois
function buildPhases(): PhaseBase[] {
  return [
    new SpeakPhase('speak-1', 'Premier message'),
    new ActionPhase(),
    new SpeakPhase('speak-2', 'Deuxième message')
  ];
}
```

## Checklist de Migration

- [ ] Analyser la phase actuelle et identifier les étapes
- [ ] Créer la structure de dossiers pour les mini-phases
- [ ] Extraire et organiser les messages vocaux
- [ ] Créer les mini-phases de base (intro, conclusion)
- [ ] Créer les mini-phases paramétrées
- [ ] Créer les mini-phases composées si nécessaire
- [ ] Refactoriser la phase principale en orchestrateur
- [ ] Gérer l'état partagé entre mini-phases
- [ ] Migrer les event listeners Unity
- [ ] Tester le build (npm run build)
- [ ] Tester l'application
- [ ] Documenter l'architecture
- [ ] Créer des tests unitaires

## Pièges à Éviter

### ❌ Erreur 1: Essayer de modifier `phases` après construction

```typescript
// ❌ FAUX
export class MyPhase extends SequencePhase {
  constructor() {
    super('my-phase', [], 'Title');
    this.phases = this.buildPhases(); // ❌ phases est private!
  }
}

// ✅ CORRECT
export class MyPhase extends SequencePhase {
  constructor() {
    super('my-phase', buildPhases(), 'Title');
  }
}
```

### ❌ Erreur 2: Ne pas appeler `complete()`

```typescript
// ❌ FAUX - La phase ne se terminera jamais
export class MyPhase extends PhaseBase {
  async execute(): Promise<void> {
    await this.speak('Message');
    // Oubli de complete()!
  }
}

// ✅ CORRECT
export class MyPhase extends PhaseBase {
  async execute(): Promise<void> {
    await this.speak('Message');
    this.complete(); // ✅
  }
}
```

### ❌ Erreur 3: État mal géré entre mini-phases

```typescript
// ❌ FAUX - État perdu entre mini-phases
class Phase1 extends PhaseBase {
  private data = 'test'; // ❌ Perdu après la phase
}

// ✅ CORRECT - Utiliser GameState
class Phase1 extends PhaseBase {
  async execute() {
    this.updateGameState({ data: 'test' }); // ✅
    this.complete();
  }
}

class Phase2 extends PhaseBase {
  async execute() {
    const data = this.getGameState().data; // ✅ Récupéré
    this.complete();
  }
}
```

### ❌ Erreur 4: Event listeners non nettoyés

```typescript
// ❌ FAUX - Risque de memory leak
async execute() {
  window.addEventListener('click', this.handler); // ❌
}

// ✅ CORRECT - Auto-cleanup
async execute() {
  this.onEvent('click', this.handler); // ✅ Nettoyé automatiquement
}
```

## Ressources

- [MINI_PHASES_ARCHITECTURE.md](./MINI_PHASES_ARCHITECTURE.md) - Architecture détaillée
- [abstract-phase.ts](../src/games/core/phases/abstract-phase.ts) - PhaseBase
- [sequence-phase.ts](../src/games/core/phases/sequence-phase.ts) - SequencePhase
- [column-understanding-phase.ts](../src/games/counting/phases/column-understanding-phase.ts) - Exemple de migration

## Conclusion

La migration vers des mini-phases améliore la maintenabilité, la testabilité et la lisibilité du code. Suivez ce guide étape par étape pour transformer vos phases monolithiques en architectures modulaires.

N'hésitez pas à vous inspirer de la refactorisation de `ColumnUnderstandingPhase` comme référence!
