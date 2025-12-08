/**
 * Timing constants for mini-phases
 * These values control the delays between different phases to ensure
 * proper timing for speech playback and user comprehension
 */

/** Delay after stage introduction before starting exercises (ms) */
export const STAGE_INTRO_DELAY = 2000;

/** Delay after stage completion before transitioning to next stage (ms) */
export const STAGE_COMPLETION_DELAY = 3000;

/** Delay after number introduction before starting column fill (ms) */
export const NUMBER_INTRO_DELAY = 2000;

/** Delay after number completion before starting next number (ms) */
export const NUMBER_COMPLETION_DELAY = 2000;

/** Delay for auto-advance after correct column value (ms) */
export const AUTO_ADVANCE_DELAY = 800;

/** Delay after column validation before next column (ms) */
export const COLUMN_TRANSITION_DELAY = 1000;
