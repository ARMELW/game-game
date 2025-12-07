# Voice Assistant Implementation Guide

## Overview

This document describes the voice assistant feature added to the counting machine tutorial. The assistant speaks like a teacher, providing guidance, encouragement, and educational explanations throughout the learning journey.

## Features

### 1. Teacher-Like Personality

The voice assistant has been configured with:
- **Slower speech rate** (0.85): Gives students time to understand
- **Higher pitch** (1.1): More engaging and friendly
- **French language**: Native fr-FR support
- **Educational tone**: Explanations are clear and pedagogical

### 2. Voice Integration Across All Phases

#### Phase 1: Discovery Phase (Button Learning)

**Voice Features:**
- Welcome introduction explaining the machine
- Instructions for green (up) and red (down) buttons
- Encouragement after each successful click
- Boundary enforcement with voice warning when exceeding limit (max 3)
- Success celebration when completing the exercise

**Example Messages:**
- "Bonjour ! Je suis ton assistant vocal. Bienvenue dans l'aventure des nombres !"
- "Excellent ! Continue comme ça !"
- "Attention ! Pour cet exercice, nous ne dépassons pas 3."

#### Phase 2: Column Understanding Phase (Place Value Learning)

**Voice Features:**
- Progressive unlocking explanation
- Educational explanation for each position:
  - **Units**: "Like counting on fingers, 0-9"
  - **Tens**: "10 units grouped together, up to 90"
  - **Hundreds**: "100 units or 10 tens, up to 900"
  - **Thousands**: "1000 units! The biggest on this machine"
- 3 mini-challenges per position to practice
- Final review with 3 complete numbers
- Encouragement throughout the learning

**Educational Approach:**
1. Start with all positions locked
2. Unlock units → explain → 3 challenges
3. Unlock tens → explain → 3 challenges
4. Unlock hundreds → explain → 3 challenges
5. Unlock thousands → explain → 3 challenges
6. Final review: all unlocked, 3 complete numbers

**Example Messages:**
- "Commençons par la position la plus à droite : l'unité."
- "L'unité représente les nombres de zéro à neuf. C'est comme compter sur tes doigts d'une seule main !"
- "Une dizaine, c'est comme avoir 10 unités regroupées ensemble."

#### Phase 3: Free Practice Phase

**Voice Features:**
- Introduction to free practice
- Varied success messages based on milestone counts:
  - First success: Special celebration
  - Every 3rd, 5th success: Extra encouragement
  - Every 5 successes: "Fantastique ! {count} exercices réussis !"
- Error feedback with gentle guidance
- Farewell message with final count

**Example Messages:**
- "Bravo ! Tu as réussi ton premier exercice !"
- "Incroyable ! Cinq exercices ! Tu es vraiment doué !"
- "Hmmm, ce n'est pas tout à fait ça. Regarde bien le nombre demandé et réessaie !"

## Technical Implementation

### Speech Service Configuration

The speech service is configured in `src/games/core/config/speech-config.ts`:

```typescript
export const SPEECH_CONFIG = {
  provider: 'web',
  defaultConfig: {
    lang: 'fr-FR',
    rate: 0.85,  // Slower for clarity
    pitch: 1.1,  // Higher for engagement
    volume: 1.0,
  },
};
```

### Using Speech in Phases

All phases can use the `speak()` method inherited from `PhaseBase`:

```typescript
await this.speak('Message to speak');
```

The method is asynchronous, allowing for sequential voice messages:

```typescript
await this.speak('First message');
await this.speak('Second message');
```

### Speech Providers

Two providers are available:

1. **Web Speech API** (default): Browser's built-in text-to-speech
   - No API key required
   - Works offline
   - Voice quality varies by browser/OS

2. **ElevenLabs** (optional): High-quality AI voices
   - Requires API key
   - Better voice quality
   - Costs per character

## Boundary Handling

### Discovery Phase Limits

The discovery phase enforces a maximum value of 3 in the units position:

```typescript
private readonly maxUnitsValue = 3;

// In handleUnityClick:
if (currentValue > this.maxUnitsValue) {
  this.sendToUnity('SetValue', `000${this.maxUnitsValue}`);
  await this.speak('Attention ! Pour cet exercice, nous ne dépassons pas 3.');
  return;
}
```

This prevents students from exceeding the intended learning scope and provides immediate voice feedback.

## Best Practices

### Voice Message Design

1. **Keep it conversational**: Use natural language
2. **Be encouraging**: Positive reinforcement throughout
3. **Be specific**: Clear instructions and explanations
4. **Vary messages**: Different messages for repeated actions
5. **Time appropriately**: Allow time between messages

### Sequential Messages

Use `await` for sequential messages to avoid overlap:

```typescript
await this.speak('First instruction');
await this.speak('Second instruction');
// Code that depends on user understanding both messages
```

### Non-blocking Messages

For background encouragement, don't await:

```typescript
this.speak('Great job!'); // Doesn't block
// Continue with other logic
```

## Accessibility Considerations

- Voice assistant provides audio feedback for visual UI
- Clear, slow speech helps non-native speakers
- Messages complement visual UI (not replace it)
- Can be muted/stopped if needed (future enhancement)

## Future Enhancements

Potential improvements for the voice assistant:

1. **Voice selection**: Let users choose preferred voice
2. **Speed control**: Adjustable speech rate
3. **Mute/unmute**: Toggle voice on/off
4. **Volume control**: Adjustable volume
5. **Replay**: Repeat last message
6. **Multiple languages**: Support for other languages
7. **ElevenLabs integration**: Premium voice option with API key
8. **Voice activity indicator**: Visual feedback when speaking

## Testing

### Manual Testing Checklist

- [ ] Phase 1: All voice messages play correctly
- [ ] Phase 1: Boundary warning triggers at value 4
- [ ] Phase 2: Explanations play for each position
- [ ] Phase 2: Challenges work correctly
- [ ] Phase 3: Success messages vary appropriately
- [ ] Phase 3: Error messages provide helpful guidance
- [ ] Voice quality is clear and understandable
- [ ] Messages don't overlap or cut off
- [ ] Voice timing allows for user comprehension

### Browser Compatibility

Tested with Web Speech API in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

Note: Voice quality and available voices vary by browser and operating system.

## Troubleshooting

### No Voice Output

1. Check browser supports Web Speech API
2. Check system volume
3. Check browser permissions
4. Try different browser

### Voice Cut Off

1. Increase delays between messages
2. Check for overlapping `speak()` calls
3. Ensure previous speech completes before new one

### Wrong Language

1. Verify `lang: 'fr-FR'` in config
2. Check browser has French voice installed
3. Fallback to default browser voice if needed

## Summary

The voice assistant transforms the counting machine from a silent tutorial into an interactive, engaging learning experience. It guides students through each phase with clear explanations, encouragement, and immediate feedback, making the learning process more accessible and enjoyable.
