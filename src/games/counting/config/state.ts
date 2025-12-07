import { StateManager } from "../../core/phases/state-manager";
import { unityBridge } from './bridge'
type Question = {
    question: string;
    options: string[];
    answerIndex: number;
};

type QuizState = {
    currentQuestionIndex: number;
    score: number;
    questions: Question[];
};
const quizState: QuizState = {
    currentQuestionIndex: 0,
    score: 0,
    questions: [
        {
            question: "Quelle est la capitale de la France ?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            answerIndex: 2,
        },
        {
            question: "Quelle est la plus grande planète du système solaire ?",
            options: ["Terre", "Jupiter", "Saturne", "Mars"],
            answerIndex: 1,
        },
    ],

}
export const quizStateManager = new StateManager<QuizState>(
    quizState,
    unityBridge
);

quizStateManager.on('phaseStarted', (data) => {

    console.log(`  → Phase démarrée: ${data.phaseId}`);
});

quizStateManager.on('phaseFinished', (data) => {
    console.log(`  ← Phase terminée: ${data.phaseId}`);
});

quizStateManager.on('gameStateChanged', (data) => {
    console.log('  🎮 Game state changé:', data.updates);
});