# Tutorial System Implementation

This document describes the three-phase tutorial system implementation for the counting machine game.

## Overview

The tutorial system guides users through learning how to use the counting machine interface with three progressive phases:

1. **Discovery Phase**: Users learn the basic button interactions
2. **Column Understanding Phase**: Users learn what each digit column represents
3. **Free Practice Phase**: Users practice freely with random numbers

## Architecture

### Phase System

The implementation uses the existing phase-based architecture:

- `PhaseBase`: Abstract base class for all phases
- `GameOrchestrator`: Manages phase sequencing
- `StateManager`: Handles state and events

### Components

#### 1. Discovery Phase (`discovery-phase.ts`)

**Purpose**: Introduce users to the up/down buttons

**Flow**:
- Locks thousands, hundreds, and tens (only units unlocked)
- Tracks up clicks (↑) and down clicks (↓)
- Requires 3 clicks each before allowing progression
- Shows progress: "↑ 0/3  ↓ 0/3"
- Shows validate button when goal is reached

**Key Features**:
- Listens to `SetValueUpdate` events from Unity
- Compares current value with previous to detect up/down
- Updates UI state with progress information

#### 2. Column Understanding Phase (`column-understanding-phase.ts`)

**Purpose**: Teach users the meaning of each digit position

**Flow**:
- Generates 3 random 4-digit numbers
- For each number:
  - Guides user digit by digit (Unit → Ten → Hundred → Thousand)
  - Unlocks only the current column being taught
  - Validates when the digit is set correctly
  - Moves to next digit automatically
- Shows completion message after all 3 numbers

**Key Features**:
- Progressive unlocking of columns
- Real-time validation of digit values
- Ensures previous digits remain correct
- Visual feedback for each sub-step

#### 3. Free Practice Phase (`free-practice-phase.ts`)

**Purpose**: Allow users to practice freely with feedback

**Flow**:
- Unlocks all columns
- Generates random numbers (0000-9999)
- User sets the number and clicks validate
- On success: Shows "✓ Bravo!" and generates new number
- On failure: Shows "✗ Pas tout à fait..." and allows retry
- Quit button always visible to exit

**Key Features**:
- Success counter tracking
- Continuous practice loop
- Graceful exit with summary
- Real-time value tracking

### UI Component (`TutorialUI.tsx`)

React component that displays:
- Main instruction message
- Progress indicator
- Success counter
- Validate button (when appropriate)
- Quit button (when appropriate)

Listens to `gameStateChanged` events from the state manager and updates display accordingly.

## Unity Bridge Integration

### Messages to Unity

The following messages are sent to Unity to control the counting machine:

- `SetValue`: Set the displayed value (e.g., "0000", "1234")
- `ChangeList`: Update the list of target numbers (e.g., "1234/5678/9012")
- `LockThousand`: Lock/unlock thousands column (0=unlock, 1=lock)
- `LockHundred`: Lock/unlock hundreds column
- `LockTen`: Lock/unlock tens column
- `LockUnit`: Lock/unlock units column

### Messages from Unity

Unity sends messages through `window.onUnityMessage`:

- `SetValueXXXX`: When the value changes (e.g., "SetValue0005")
  - Parsed and converted to `SetValueUpdate` event with payload `{ value: "XXXX" }`

### Bridge Setup

The Unity bridge (`bridge.ts`) is configured to:
1. Receive messages via `window.onUnityMessage`
2. Parse Unity messages and convert to typed events
3. Send messages to Unity via the `sendMessage` callback
4. Handle message queuing when Unity is not ready

## State Management

### Game State Interface

```typescript
interface TutorialGameState {
    message: string;              // Main instruction message
    progress: string;             // Progress indicator (e.g., "↑ 0/3  ↓ 0/3")
    showValidateButton: boolean;  // Whether to show validate button
    showQuitButton: boolean;      // Whether to show quit button
    successCount: number;         // Number of successful exercises
    targetNumber: string;         // Current target number
    currentDigit: string;         // Current digit being taught
    lastValue: number;            // Last value for comparison
}
```

### Event Flow

1. Phase executes and sends Unity commands
2. Unity sends back value updates
3. Phase processes updates and changes state
4. UI component reacts to state changes
5. User clicks buttons → Events emitted
6. Phase handles button events and progresses

## Testing Considerations

Since this implementation requires the Unity runtime, manual testing should verify:

1. **Phase 1**:
   - Only units column is unlocked
   - Up/down clicks are correctly tracked
   - Progress counter updates correctly
   - Validation button appears at 3/3 clicks

2. **Phase 2**:
   - Columns unlock progressively
   - Instructions match the current digit
   - Previous digits remain correct
   - All 3 numbers complete successfully

3. **Phase 3**:
   - All columns are unlocked
   - Random numbers are different each time
   - Validation works correctly
   - Success counter increments
   - Quit button exits gracefully

## Future Improvements

Potential enhancements:

1. Add animations for state transitions
2. Add sound effects for success/failure
3. Save progress to local storage
4. Add difficulty levels (more digits, time limits)
5. Add achievements system
6. Internationalization support
7. Accessibility improvements (keyboard navigation, screen readers)

## Dependencies

- React 19.1.1
- react-unity-webgl 10.1.5
- Zustand 5.0.8 (for state management)
- Existing phase system architecture
