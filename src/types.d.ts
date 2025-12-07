export { };

declare global {
    interface Window {
        onUnityMessage?: (message: string) => void;
    }
}
