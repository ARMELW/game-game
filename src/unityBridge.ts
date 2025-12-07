// Global Unity Bridge Functions
// These functions allow direct JavaScript access to Unity controls

// Extend window to include Unity bridge functions
declare global {
  interface Window {
    unityInstance?: {
      SendMessage: (objectName: string, methodName: string, value?: string | number) => void;
    };
    onUnityMessage?: (message: string) => void;
    ChangeCurrentValue?: () => void;
    ChangeCurrentGoalList?: () => void;
    LockThousandRoll?: (locked: boolean) => void;
    LockHundredRoll?: (locked: boolean) => void;
    LockTenRoll?: (locked: boolean) => void;
    LockUnitRoll?: (locked: boolean) => void;
    HighlightUnitButtons?: (highlighted: boolean) => void;
  }
}

// cette fonction sert à changer le nombre afficher sur la machine
// SetValue322 -> la machine affichera 0322
export function ChangeCurrentValue() {
  const value = (document.getElementById("currentValue") as HTMLInputElement)?.value;
  if (typeof window.unityInstance !== 'undefined' && value) {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'SetValue' + value);
  }
}

// cette fonction sert à envoyer la liste des objectifs vers Unity
// ChangeList544/1352/9871 -> les objectifs seront 544 puis 1352 puis 9871
export function ChangeCurrentGoalList() {
  const value = (document.getElementById("currentGoalList") as HTMLInputElement)?.value;
  if (typeof window.unityInstance !== 'undefined' && value) {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'ChangeList' + value);
  }
}

// cette fonction sert à envoyer la liste des objectifs vers Unity de manière programmatique
// sendChallengeListToUnity([544, 1352, 9871]) -> enverra "ChangeList544/1352/9871"
export function sendChallengeListToUnity(targets: number[]) {
  if (typeof window.unityInstance !== 'undefined' && targets && targets.length > 0) {
    const value = targets.join('/');
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'ChangeList' + value);
  }
}

export function setValue(value: number) {
  console.log('ici');
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', `SetValue${value}`);
  }
}
// cette fonction sert à bloquer/débloquer le rouleau des 1000
export function LockThousandRoll(locked: boolean) {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockThousand:' + (locked ? 1 : 0));
  }
}



// cette fonction sert à bloquer/débloquer le rouleau des 100
export function LockHundredRoll(locked: boolean) {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockHundred:' + (locked ? 1 : 0));
  }
}

// cette fonction sert à bloquer/débloquer le rouleau des 10
export function LockTenRoll(locked: boolean) {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockTen:' + (locked ? 1 : 0));
  }
}

// cette fonction sert à bloquer/débloquer le rouleau des 1
export function LockUnitRoll(locked: boolean) {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockUnit:' + (locked ? 1 : 0));
  }
}

// cette fonction sert à mettre en évidence les boutons de l'unité (Haut et Bas)
export function HighlightUnitButtons(highlighted: boolean) {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'HighlightUnitButtons:' + (highlighted ? 1 : 0));
  }
}

// Send message to Unity when validation button is clicked
export function sendValidationButtonClicked() {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'on valid button clicked');
  }
}

// Send message to Unity when answer is correct
export function sendCorrectValue() {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'correct value');
  }
}

// Send message to Unity when answer is wrong
export function sendWrongValue() {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'wrong value');
  }
}

// Send message to Unity to move to next goal
export function sendNextGoal() {
  if (typeof window.unityInstance !== 'undefined') {
    window.unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'next goal');
  }
}

// Default handler for Unity messages
export function onUnityMessage(_message: string) {
  // Message handler - can be overridden by setting window.onUnityMessage
}

// Initialize global functions
export function initializeUnityBridge() {
  window.ChangeCurrentValue = ChangeCurrentValue;
  window.ChangeCurrentGoalList = ChangeCurrentGoalList;
  window.LockThousandRoll = LockThousandRoll;
  window.LockHundredRoll = LockHundredRoll;
  window.LockTenRoll = LockTenRoll;
  window.LockUnitRoll = LockUnitRoll;
  window.HighlightUnitButtons = HighlightUnitButtons;
  window.onUnityMessage = onUnityMessage;
}
