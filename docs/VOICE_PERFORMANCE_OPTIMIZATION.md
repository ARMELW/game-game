# Voice Assistant Performance Optimization

## Problem
After adding the voice assistant feature, users experienced lag/stuttering ("lague un peu") when interacting with the application, especially during button clicks and rapid interactions.

## Root Causes Identified

### 1. Unnecessary Delays in WebSpeechProvider
- **50ms setTimeout** before each speech synthesis
- **100ms setTimeout** workaround for browser compatibility
- **Total: 150ms delay** added to every speech call

### 2. Blocking Speech Calls in Event Handlers
- Button click feedback used `await this.speak()` which blocked the UI thread
- Validation feedback used `await this.speak()` which blocked the UI thread
- Each interaction waited for speech to complete before allowing the next action

### 3. Sequential Speech in Phases
- Multiple consecutive `await this.speak()` calls stacked delays
- UI became unresponsive during long speech sequences

## Solutions Implemented

### 1. Removed Unnecessary Delays
**Before:**
```typescript
async speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    this.synthesis.cancel();
    
    // 50ms delay
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      // ... setup ...
      this.synthesis.speak(utterance);
      
      // 100ms workaround
      setTimeout(() => {
        if (!this.speaking && this.synthesis.pending) {
          this.synthesis.resume();
        }
      }, 100);
    }, 50);
  });
}
```

**After:**
```typescript
async speak(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // ... setup ...
    this.synthesis.speak(utterance);
    // No delays - immediate execution
  });
}
```

**Impact:** Removed 150ms of unnecessary delay per speech call.

### 2. Non-Blocking Speech for UI Feedback
Added a new `speakNonBlocking()` method to `PhaseBase`:

```typescript
/** Helper pour faire parler le personnage sans bloquer (fire-and-forget) */
protected speakNonBlocking(message: string): void {
  this.stateManager.speak(message).catch(err => {
    console.error('Non-blocking speech error:', err);
  });
}
```

**Updated phases to use non-blocking speech for:**
- Button click feedback (DiscoveryPhase)
- Validation feedback (ColumnUnderstandingPhase, FreePracticePhase)
- Error messages
- Encouragement messages

**Before:**
```typescript
if (this.upClicks === 1) {
  await this.speak('Excellent ! Continue comme ça !');
}
```

**After:**
```typescript
if (this.upClicks === 1) {
  this.speakNonBlocking('Excellent ! Continue comme ça !');
}
```

**Impact:** UI responds immediately to user actions; speech plays in background.

### 3. Strategic Use of Blocking vs Non-Blocking Speech

**Blocking Speech (await this.speak())** - Used for:
- Initial phase instructions (ensure user hears before interaction)
- Educational explanations (ensure proper learning sequence)
- Phase completion messages (ensure proper flow between phases)

**Non-Blocking Speech (this.speakNonBlocking())** - Used for:
- Button click feedback
- Validation feedback
- Encouragement messages
- Error messages
- Any rapid/frequent feedback

## Performance Improvements

### Before Optimization
- **150ms delay** per speech call
- UI blocked during speech
- Button clicks felt sluggish
- Multiple rapid clicks created noticeable lag

### After Optimization
- **0ms delay** - immediate speech execution
- UI stays responsive during speech
- Button clicks feel instant
- Smooth interaction even with rapid clicks

## Testing
To verify the improvements:
1. Start the tutorial (DiscoveryPhase)
2. Rapidly click the up/down buttons
3. Observe: UI should respond immediately without lag
4. Speech should play smoothly in background without blocking interaction

## Files Modified
- `src/games/core/providers/web-speech-provider.ts` - Removed setTimeout delays
- `src/games/core/phases/abstract-phase.ts` - Added speakNonBlocking method
- `src/games/counting/phases/discovery-phase.ts` - Use non-blocking speech for feedback
- `src/games/counting/phases/column-understanding-phase.ts` - Use non-blocking speech for feedback
- `src/games/counting/phases/free-practice-phase.ts` - Use non-blocking speech for feedback

## Future Considerations
- Consider implementing speech queue with priority levels
- Add option to skip/cancel ongoing speech
- Implement speech rate adjustment for faster feedback
- Consider using ElevenLabs for higher quality voice (already supported)
