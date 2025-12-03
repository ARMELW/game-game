export type Column = {
    name: string;
    value: number;
    unlocked: boolean;
    color: string;
};

export type Phase =
  | 'loading'
    | 'intro-welcome'
    | 'intro-welcome-personalized'
    | 'intro-discover'
    | 'intro-discover-machine'
    | 'intro-first-interaction'
    | 'intro-count-digits'
    | 'intro-challenge-introduction'
    | 'intro-question-digits'
    | 'intro-add-roll'
    | 'intro-question-max'
    | 'intro-second-column'
    | 'intro-discover-carry'
    | 'intro-max-value-question'
    | 'tutorial'
    | 'tutorial-challenge'
    | 'explore-units'
    | 'click-add'
    | 'click-remove'
    | 'challenge-unit-intro'
    | 'challenge-unit-1'
    | 'challenge-unit-2'
    | 'challenge-unit-3'
    | 'delock-dizaines'
    | 'learn-carry'
    | 'practice-ten'
    | 'learn-ten-to-twenty'
    | 'challenge-ten-to-twenty'
    | 'learn-twenty-to-thirty'
    | 'intro-learn-tens'
    | 'learn-tens'
    | 'learn-tens-combination'
    | 'challenge-tens-1'
    | 'challenge-tens-2'
    | 'challenge-tens-3'
    | 'intro-three-column'
    | 'delock-hundreds'
    | 'practice-hundred'
    | 'learn-hundred-to-hundred-ten'
    | 'learn-hundred-ten-to-two-hundred'
    | 'challenge-hundred-to-two-hundred'
    | 'learn-two-hundred-to-three-hundred'
    | 'challenge-two-hundred-to-three-hundred'
    | 'intro-learn-hundreds'
    | 'learn-hundreds'
    | 'learn-hundreds-simple-combination'
    | 'learn-hundreds-combination'
    | 'challenge-hundreds-1'
    | 'challenge-hundreds-2'
    | 'challenge-hundreds-3'
    | 'intro-four-column'
    | 'delock-thousands'
    | 'celebration-before-thousands'
    | 'practice-thousand'
    | 'learn-thousand-to-thousand-ten'
    | 'learn-thousand-to-thousand-hundred'
    | 'learn-thousand-hundred-to-two-thousand'
    | 'challenge-thousand-to-two-thousand'
    | 'learn-two-thousand-to-three-thousand'
    | 'challenge-two-thousand-to-three-thousand'
    | 'intro-learn-thousands'
    | 'learn-thousands'
    | 'learn-thousands-very-simple-combination'
    | 'challenge-thousands-simple-combination'
    | 'learn-thousands-full-combination'
    | 'learn-thousands-combination'
    | 'challenge-thousands-1'
    | 'challenge-thousands-2'
    | 'challenge-thousands-3'
    | 'celebration-thousands-complete'
    | 'normal'
    | 'done'
    | 'learn-units'
    // Simplified tutorial phases (3 phases)
    | 'didacticiel-step1-buttons'      // Étape 1: Découverte des boutons
    | 'didacticiel-step2-columns'      // Étape 2: Compréhension des colonnes
    | 'didacticiel-step3-free-practice'; // Étape 3: Exercices libres

// Phase completion status
export type PhaseCompletionStatus = 'not-started' | 'in-progress' | 'completed';

// Phase status information
export interface PhaseStatus {
  phase: Phase;
  status: PhaseCompletionStatus;
  completedAt?: number; // timestamp when completed
}

// Map of phase completion statuses
export type PhaseStatusMap = Record<Phase, PhaseCompletionStatus>;

// Ordered array of all phases in the application flow
export const ALL_PHASES: readonly Phase[] = [
  'loading',
  'intro-welcome',
  'intro-discover',
  'intro-discover-machine',
  'intro-first-interaction',
  'intro-count-digits',
  'challenge-unit-intro',
  'challenge-unit-1',
  'challenge-unit-2',
  'challenge-unit-3',
  'intro-second-column',
  'delock-dizaines',
  'practice-ten',
  'learn-ten-to-twenty',
  'challenge-ten-to-twenty',
  'learn-twenty-to-thirty',
  'intro-learn-tens',
  'learn-tens',
  'challenge-tens-1',
  'challenge-tens-2',
  'challenge-tens-3',
  'intro-three-column',
  'delock-hundreds',
  'practice-hundred',
  'learn-hundred-to-hundred-ten',
  'learn-hundred-ten-to-two-hundred',
  'challenge-hundred-to-two-hundred',
  'learn-two-hundred-to-three-hundred',
  'challenge-two-hundred-to-three-hundred',
  'intro-learn-hundreds',
  'learn-hundreds',
  'challenge-hundreds-1',
  'challenge-hundreds-2',
  'challenge-hundreds-3',
  'intro-four-column',
  'delock-thousands',
  'celebration-before-thousands',
  'practice-thousand',
  'learn-thousand-to-thousand-ten',
  'learn-thousand-to-thousand-hundred',
  'learn-thousand-hundred-to-two-thousand',
  'challenge-thousand-to-two-thousand',
  'learn-two-thousand-to-three-thousand',
  'challenge-two-thousand-to-three-thousand',
  'intro-learn-thousands',
  'learn-thousands',
  'challenge-thousands-1',
  'challenge-thousands-2',
  'challenge-thousands-3',
  'celebration-thousands-complete',
  'normal',
  'done',
  // Simplified tutorial phases (3 phases)
  'didacticiel-step1-buttons',
  'didacticiel-step2-columns',
  'didacticiel-step3-free-practice',
] as const;

// Simplified tutorial phases for the 3-step didacticiel
export const SIMPLIFIED_TUTORIAL_PHASES: readonly Phase[] = [
  'didacticiel-step1-buttons',
  'didacticiel-step2-columns',
  'didacticiel-step3-free-practice',
] as const;

export type Challenge = {
    phase: Phase;
    targets: number[];
};

export const FEEDBACK_DELAY = 2500;

export const TUTORIAL_CHALLENGE: Challenge = {
  phase: 'tutorial-challenge',
  targets: [3] // Just one simple value to learn validation
};

export const UNIT_CHALLENGES: Challenge[] = [
  { phase: 'challenge-unit-1', targets: [3, 5, 7] },
  { phase: 'challenge-unit-2', targets: [2, 6, 8] },
  { phase: 'challenge-unit-3', targets: [4, 9, 1] }
];

export const TEN_TO_TWENTY_CHALLENGES: Challenge[] = [
  { phase: 'challenge-ten-to-twenty', targets: [12, 15, 18] }
];

export const TENS_CHALLENGES: Challenge[] = [
  { phase: 'challenge-tens-1', targets: [23, 45] },
  { phase: 'challenge-tens-2', targets: [12, 34, 56, 78] },
  { phase: 'challenge-tens-3', targets: [21, 43, 65, 87, 19, 92] }
];

export const HUNDRED_TO_TWO_HUNDRED_CHALLENGES: Challenge[] = [
  { phase: 'challenge-hundred-to-two-hundred', targets: [110, 125, 150, 167, 190] }
];

export const TWO_HUNDRED_TO_THREE_HUNDRED_CHALLENGES: Challenge[] = [
  { phase: 'challenge-two-hundred-to-three-hundred', targets: [210, 250, 280] }
];

export const HUNDREDS_CHALLENGES: Challenge[] = [
  { phase: 'challenge-hundreds-1', targets: [100, 200, 300, 120, 250] }, // Facile à moyen
  { phase: 'challenge-hundreds-2', targets: [140, 230, 340, 156, 278] }, // Moyen
  { phase: 'challenge-hundreds-3', targets: [123, 267, 389, 456, 598] }  // Difficile
];

export const THOUSAND_TO_TWO_THOUSAND_CHALLENGES: Challenge[] = [
  { phase: 'challenge-thousand-to-two-thousand', targets: [1001, 1005, 1010, 1050, 1100, 1500, 1230] }
];

export const TWO_THOUSAND_TO_THREE_THOUSAND_CHALLENGES: Challenge[] = [
  { phase: 'challenge-two-thousand-to-three-thousand', targets: [2000, 2100, 2500, 2900] }
];

export const THOUSANDS_SIMPLE_COMBINATION_CHALLENGES: Challenge[] = [
  { phase: 'challenge-thousands-simple-combination', targets: [1000, 2000, 3500, 5000, 7100] }
];

export const THOUSANDS_CHALLENGES: Challenge[] = [
  { phase: 'challenge-thousands-1', targets: [1000, 2000, 3000, 1100, 2500, 1010, 2020] }, // Facile
  { phase: 'challenge-thousands-2', targets: [1234, 2345, 3456, 1500, 2750, 4321, 5678] }, // Moyen
  { phase: 'challenge-thousands-3', targets: [1999, 2468, 3579, 5432, 6789, 7890, 8765] }  // Difficile
];

// ============================================================================
// SIMPLIFIED TUTORIAL (DIDACTICIEL) - 3 PHASES
// ============================================================================

// Step 2: Column understanding challenges - 3 numbers to fill
export const DIDACTICIEL_STEP2_CHALLENGES: Challenge = {
  phase: 'didacticiel-step2-columns',
  targets: [1234, 5678, 9012] // 3 numbers for step 2
};

// Step 3: Free practice - random numbers
export const DIDACTICIEL_STEP3_NUMBERS = [
  1357, 2468, 3579, 4680, 5791, 6802, 7913, 8024, 9135, 1246,
  2357, 3468, 4579, 5680, 6791, 7802, 8913, 9024, 1235, 2346
];

// Helper function to get a random number for step 3
export function getRandomDidacticielNumber(): number {
  return DIDACTICIEL_STEP3_NUMBERS[Math.floor(Math.random() * DIDACTICIEL_STEP3_NUMBERS.length)];
}

export interface MachineState {
    columns: Column[];
    phase: Phase;
    addClicks: number;
    feedback: string;
    instruction: string;
    pendingAutoCount: boolean;
    isTransitioningToChallenge: boolean;
    isCountingAutomatically: boolean;
    nextPhaseAfterAuto: Phase | null;
    completedChallenges: {
        tens: boolean;
        hundreds: boolean;
        thousands: boolean;
    };
    tutorialChallengeTargetIndex: number;
    tutorialChallengeSuccessCount: number;
    unitTargetIndex: number;
    unitSuccessCount: number;
    tensTargetIndex: number;
    tensSuccessCount: number;
    hundredsTargetIndex: number;
    hundredsSuccessCount: number;
    thousandsTargetIndex: number;
    thousandsSuccessCount: number;
    tenToTwentyTargetIndex: number;
    tenToTwentySuccessCount: number;
    practiceTenRepetitions: number;
    practiceHundredCount: number;
    hundredToTwoHundredTargetIndex: number;
    hundredToTwoHundredSuccessCount: number;
    twoHundredToThreeHundredTargetIndex: number;
    twoHundredToThreeHundredSuccessCount: number;
    practiceThousandCount: number;
    thousandToTwoThousandTargetIndex: number;
    thousandToTwoThousandSuccessCount: number;
    twoThousandToThreeThousandTargetIndex: number;
    twoThousandToThreeThousandSuccessCount: number;
    thousandsSimpleCombinationTargetIndex: number;
    thousandsSimpleCombinationSuccessCount: number;
    timer: number | null;

  // Unity loading state
  unityLoaded: boolean;
  unityLoadingProgression: number;

  // Phase completion tracking
  phaseStatusMap: PhaseStatusMap;
  autoTransitionEnabled: boolean;

  // Feedback sequence state
  feedbackSequence: string[];
  feedbackSequenceStep: number;
  feedbackSequenceCallback: (() => void) | null;

  userInput: string;
  showInputField: boolean;

  // Error management and feedback system
  attemptCount: number;
  consecutiveFailures: number;
  frustrationLevel: 'low' | 'medium' | 'high';
  showHelpOptions: boolean;
  guidedMode: boolean;
  guidedStep: number;
  totalChallengesCompleted: number;
  helpChoice: 'tryAgain' | 'guided' | 'showSolution' | null;
  showSolutionAnimation: boolean;
  solutionAnimationStep: number;
  currentTarget: number;
  lastFeedbackMessage: string;

  // Personalization and intro state
  userName: string;
  introClickCount: number;
  introDigitsAttempt: number;
  introMaxAttempt: number;
  showResponseButtons: boolean;
  selectedResponse: string | null;

  // Simplified tutorial (didacticiel) state
  didacticielStep1UpClicks: number;      // Count of Up button clicks in step 1
  didacticielStep1DownClicks: number;    // Count of Down button clicks in step 1
  didacticielStep2TargetIndex: number;   // Current target index in step 2 (0, 1, 2)
  didacticielStep2SuccessCount: number;  // Number of successful completions in step 2
  didacticielStep3Target: number;        // Current random target in step 3
  didacticielStep3SuccessCount: number;  // Total successes in step 3
  showDidacticielQuitButton: boolean;    // Show quit button in step 3
  isInSimplifiedTutorial: boolean;       // Whether we are in the simplified 3-phase tutorial

  // Callback pour effet visuel/sonore lors de la transition intro-welcome
  onIntroWelcomeTransition?: (() => void) | null;

    // Button visibility
    showUnlockButton: boolean;
    showStartLearningButton: boolean;
    showValidateLearningButton: boolean;
    showValidateTensButton: boolean;
    showValidateHundredsButton: boolean;
    showValidateThousandsButton: boolean;

    // Actions
    setColumns: (updater: ((columns: Column[]) => Column[]) | Column[]) => void;
    setPhase: (phase: Phase) => void;
    setAddClicks: (clicks: number) => void;
    setFeedback: (feedback: string) => void;
    setInstruction: (instruction: string) => void;
    setPendingAutoCount: (pending: boolean) => void;
    setIsTransitioningToChallenge: (isTransitioning: boolean) => void;
    setIsCountingAutomatically: (isCounting: boolean) => void;
    setNextPhaseAfterAuto: (phase: Phase | null) => void;
    setCompletedChallenges: (updater: ((challenges: MachineState['completedChallenges']) => MachineState['completedChallenges']) | MachineState['completedChallenges']) => void;
    setAttemptCount: (count: number) => void;
    setConsecutiveFailures: (count: number) => void;
    setFrustrationLevel: (level: 'low' | 'medium' | 'high') => void;
    setShowHelpOptions: (show: boolean) => void;
    setGuidedMode: (guided: boolean) => void;
    setGuidedStep: (step: number) => void;
    setTotalChallengesCompleted: (count: number) => void;
    setHelpChoice: (choice: 'tryAgain' | 'guided' | 'showSolution' | null) => void;
    setShowSolutionAnimation: (show: boolean) => void;
    setSolutionAnimationStep: (step: number) => void;
    setCurrentTarget: (target: number) => void;
    setLastFeedbackMessage: (message: string) => void;
    handleHelpChoice: (choice: 'tryAgain' | 'guided' | 'showSolution') => void;
    advanceGuidedStep: () => void;
    advanceSolutionAnimation: () => void;
    resetAttempts: () => void;
    setUserName: (name: string) => void;
    setIntroClickCount: (count: number) => void;
    setIntroDigitsAttempt: (attempt: number) => void;
    setIntroMaxAttempt: (attempt: number) => void;
    setShowResponseButtons: (show: boolean) => void;
    setSelectedResponse: (response: string | null) => void;
    setTutorialChallengeTargetIndex: (index: number) => void;
    setTutorialChallengeSuccessCount: (count: number) => void;
    setUnitTargetIndex: (index: number) => void;
    setUnitSuccessCount: (count: number) => void;
    setTensTargetIndex: (index: number) => void;
    setTensSuccessCount: (count: number) => void;
    setHundredsTargetIndex: (index: number) => void;
    setHundredsSuccessCount: (count: number) => void;
    setThousandsTargetIndex: (index: number) => void;
    setThousandsSuccessCount: (count: number) => void;
    setTenToTwentyTargetIndex: (index: number) => void;
    setTenToTwentySuccessCount: (count: number) => void;
    setPracticeTenRepetitions: (count: number) => void;
    setPracticeHundredCount: (count: number) => void;
    setHundredToTwoHundredTargetIndex: (index: number) => void;
    setHundredToTwoHundredSuccessCount: (count: number) => void;
    setTwoHundredToThreeHundredTargetIndex: (index: number) => void;
    setTwoHundredToThreeHundredSuccessCount: (count: number) => void;
    setPracticeThousandCount: (count: number) => void;
    setThousandToTwoThousandTargetIndex: (index: number) => void;
    setThousandToTwoThousandSuccessCount: (count: number) => void;
    setTwoThousandToThreeThousandTargetIndex: (index: number) => void;
    setTwoThousandToThreeThousandSuccessCount: (count: number) => void;
    setThousandsSimpleCombinationTargetIndex: (index: number) => void;
    setThousandsSimpleCombinationSuccessCount: (count: number) => void;
    resetTutorialChallenge: () => void;
    resetUnitChallenge: () => void;
    resetTensChallenge: () => void;
    resetHundredsChallenge: () => void;
    resetThousandsChallenge: () => void;
    resetTenToTwentyChallenge: () => void;
    resetHundredToTwoHundredChallenge: () => void;
    resetTwoHundredToThreeHundredChallenge: () => void;
    resetThousandToTwoThousandChallenge: () => void;
    resetTwoThousandToThreeThousandChallenge: () => void;
    resetThousandsSimpleCombinationChallenge: () => void;
    updateInstruction: () => void;
    runAutoCount: () => void;
    updateButtonVisibility: () => void;
    setUserInput: (input: string) => void;
    setShowInputField: (show: boolean) => void;
    handleUserInputSubmit: () => void;
    setTimer: (timer: number | null) => void;
    setUnityLoaded: (loaded: boolean) => void;
    setUnityLoadingProgression: (progression: number) => void;

    // Business logic
    setFeedbackSequence: (sequence: string[], callback?: () => void) => void;
    advanceFeedbackSequence: () => void;
    sequenceFeedback: (first: string, second?: string, onComplete?: () => void) => void;
    speakAndThen: (message: string, onComplete?: () => void) => void;
    handleAdd: (idx: number) => void;
    handleSubtract: (idx: number) => void;
    handleSetValue: (value: string) => void;
    handleIntroNameSubmit: () => void;
    handleIntroMachineResponse: () => void;
    handleIntroFirstClick: () => void;
    handleIntroDigitsSubmit: () => void;
    showIntroDigitsVisual: () => void;
    runIntroDigitsGuided: () => void;
    handleIntroSecondColumnChoice: (choice: string) => void;
    handleIntroThirdColumnChoice: (choice: string) => void;
    handleIntroFourthColumnChoice: (choice: string) => void;
    handleIntroMaxSubmit: () => void;
    runIntroMaxGuided: () => void;
    completeIntroMaxGuided: () => void;
    handleValidateTutorialChallenge: () => void;
    handleValidateLearning: () => void;
    handleValidateTenToTwenty: () => void;
    handleValidateTens: () => void;
    handleValidateHundredToTwoHundred: () => void;
    handleValidateTwoHundredToThreeHundred: () => void;
    handleValidateHundreds: () => void;
    handleValidateThousands: () => void;
    handleValidateThousandToTwoThousand: () => void;
    handleValidateTwoThousandToThreeThousand: () => void;
    handleValidateThousandsSimpleCombination: () => void;
    startLearningPhase: () => void;
    unlockNextColumn: () => void;
    init: () => void;
    
    // Phase navigation functions
    goToNextPhase: () => void;
    goToPreviousPhase: () => void;
    getCurrentPhaseIndex: () => number;
    
    // Phase status tracking functions
    getPhaseStatus: (phase: Phase) => PhaseStatus;
    markPhaseComplete: (phase: Phase) => void;
    isPhaseComplete: (phase: Phase) => boolean;
    setAutoTransitionEnabled: (enabled: boolean) => void;
    checkAndTransitionToNextPhase: () => void;

    // Simplified tutorial (didacticiel) actions
    setDidacticielStep1UpClicks: (count: number) => void;
    setDidacticielStep1DownClicks: (count: number) => void;
    setDidacticielStep2TargetIndex: (index: number) => void;
    setDidacticielStep2SuccessCount: (count: number) => void;
    setDidacticielStep3Target: (target: number) => void;
    setDidacticielStep3SuccessCount: (count: number) => void;
    setShowDidacticielQuitButton: (show: boolean) => void;
    setIsInSimplifiedTutorial: (isIn: boolean) => void;
    startSimplifiedTutorial: () => void;
    handleDidacticielStep1ButtonClick: (direction: 'up' | 'down') => void;
    handleDidacticielStep2Validate: () => void;
    handleDidacticielStep3Validate: () => void;
    quitDidacticiel: () => void;
    resetDidacticiel: () => void;
}
