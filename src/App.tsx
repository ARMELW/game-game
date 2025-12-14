import { UnityGame } from "./components/UnityGame";
import { TutorialUI } from "./components/TutorialUI";

function App() {

  return (
    <div className="font-sans flex h-screen" >
      <aside style={{
        backgroundColor: 'oklch(0.42 0.1947 261.88)'
      }} className="w-[320px] min-w-[260px] max-w-[340px] h-full bg-white border-r border-slate-200 flex flex-col shadow-lg overflow-y-auto">
        <TutorialUI />
      </aside>
      <main className="flex-1 flex items-center justify-center h-full bg-slate-100">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-w-full max-h-full border-2 border-slate-300 rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <UnityGame />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
