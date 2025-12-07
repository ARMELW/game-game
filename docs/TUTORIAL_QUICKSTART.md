# Tutorial System - Quick Start Guide

## Overview

This tutorial system implements a three-phase learning experience for the counting machine game as specified in the requirements.

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tutorial Flow

### Phase 1: Button Discovery (Découverte des boutons)

**Goal**: Learn basic button interactions

**User Experience**:
1. User sees message: "Cliquez 3 fois sur ↑ et 3 fois sur ↓"
2. Progress indicator shows: "↑ 0/3  ↓ 0/3"
3. Only the units column is unlocked
4. User clicks up and down arrows on the Unity interface
5. Progress updates in real-time
6. When both counters reach 3/3:
   - Message changes to: "Bravo ! Cliquez sur Valider pour continuer"
   - Validate button appears
7. User clicks Validate → Phase 2 begins

### Phase 2: Column Understanding (Compréhension des colonnes)

**Goal**: Understand digit positions

**User Experience**:
1. Sees explanation: "Millième | Centaine | Dizaine | Unité"
2. All columns unlock briefly (3 seconds)
3. For each of 3 random numbers:
   - Starts with units: "Formez le nombre: XXXX\nRéglez l'Unité sur Y"
   - User adjusts the units column
   - When correct, automatically unlocks tens
   - Continues through tens → hundreds → thousands
   - Shows "Parfait ! Cliquez sur Valider"
   - User clicks Validate
   - Shows "✓ Bravo !"
   - Next number begins (or phase completes after 3 numbers)
4. Final message: "Vous maîtrisez maintenant les colonnes !"
5. Phase 3 begins

### Phase 3: Free Practice (Exercices libres)

**Goal**: Practice freely

**User Experience**:
1. All columns are unlocked
2. Message: "Entraînez-vous librement !"
3. Random number target shown: "Formez le nombre : XXXX"
4. Validate and Quit buttons visible
5. User sets the number and clicks Validate:
   - **Correct**: "✓ Bravo !" → Success counter increases → New number after 2 seconds
   - **Incorrect**: "✗ Pas tout à fait... Réessayez !" → User can try again
6. User can click Quit anytime:
   - Shows: "Félicitations ! Vous avez réussi X exercice(s)."
   - Tutorial ends after 3 seconds

## Technical Details

### Unity Integration

The system communicates with Unity through:

**Messages sent to Unity**:
- `SetValue0000` - Reset the machine to 0000
- `ChangeList1234/5678/9012` - Set the list of target numbers
- `LockThousand:1` or `LockThousand:0` - Lock/unlock thousands column
- `LockHundred:1` or `LockHundred:0` - Lock/unlock hundreds column
- `LockTen:1` or `LockTen:0` - Lock/unlock tens column
- `LockUnit:1` or `LockUnit:0` - Lock/unlock units column

**Messages received from Unity**:
- `SetValueXXXX` - Unity sends this when the value changes (e.g., `SetValue0006`)

### Event System

**UI Events** (triggered by buttons):
- `validateClick` - User clicked the Validate button
- `quitClick` - User clicked the Quit button

**Unity Events** (from Unity to app):
- `SetValueUpdate` - Value changed in Unity with payload `{ value: "XXXX" }`

### File Structure

```
src/
├── components/
│   ├── UnityGame.tsx           # Main Unity component
│   └── TutorialUI.tsx          # Tutorial overlay UI
├── games/
│   └── counting/
│       ├── config/
│       │   ├── bridge.ts       # Unity bridge configuration
│       │   ├── message.ts      # Message registry
│       │   └── state.ts        # State manager setup
│       └── phases/
│           ├── index.ts        # Game orchestrator
│           ├── discovery-phase.ts          # Phase 1
│           ├── column-understanding-phase.ts # Phase 2
│           └── free-practice-phase.ts      # Phase 3
└── hooks/
    └── useUnity.ts             # Unity context hook
```

## Customization

### Changing Requirements

To modify the tutorial requirements:

**Phase 1** (`discovery-phase.ts`):
- Change `requiredClicks` to require more/fewer clicks

**Phase 2** (`column-understanding-phase.ts`):
- Change `generateRandomNumbers(3)` to generate more/fewer practice numbers
- Modify `digitNames` for different labels
- Adjust timeout in `startDigitExercise` for pacing

**Phase 3** (`free-practice-phase.ts`):
- Modify random number range in `startNewExercise`
- Change success message timing

### Styling

UI styles are inline in `TutorialUI.tsx`. To customize:
- Colors: Modify gradient backgrounds
- Sizes: Adjust padding, fontSize, borderRadius
- Positioning: Change top/left/transform values
- Animations: Add CSS transitions or keyframes

## Debugging

Enable Unity bridge debug mode in `bridge.ts`:
```typescript
export const unityBridge = new UnityBridge(true) // Enable debug logging
```

This will log all messages sent to and received from Unity.

Check browser console for:
- Phase start/complete messages
- Unity message events
- State changes
- Validation results

## Known Limitations

1. Requires Unity WebGL build to be present in `public/counting-machine/`
2. Unity must send `SetValueXXXX` messages when the value changes
3. No offline mode - requires Unity runtime
4. No progress persistence between sessions

## Troubleshooting

**UI buttons don't appear**:
- Check browser console for state change events
- Verify `gameStateChanged` events are being emitted
- Check `showValidateButton` and `showQuitButton` states

**Unity messages not received**:
- Verify Unity is sending messages in correct format: `SetValueXXXX`
- Check that `window.onUnityMessage` is defined
- Enable debug mode in bridge.ts

**Phase not advancing**:
- Check that completion conditions are met
- Verify event listeners are registered
- Check for JavaScript errors in console

**Clicks not tracked (Phase 1)**:
- Verify Unity sends `SetValueUpdate` events
- Check that value comparisons work correctly
- Ensure lastValue is being tracked in state

## Support

For issues or questions:
1. Check browser console for errors
2. Enable debug mode for detailed logging
3. Review TUTORIAL_IMPLEMENTATION.md for architecture details
