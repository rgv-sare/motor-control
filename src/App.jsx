import Controls from './Controls';
import Channels from './Channels';
import Modal from "./Modal";
import Connection from './Connection';

function RootBlock() {

  return (
    <div class="g-layer w-3/5 bg-003 h-screen flex flex-col gap-4 justify-between text-slate-200 shadow-lg overflow-hidden
    max-w-[8in] max-[780px]:w-4/5  max-[640px]:w-full">
      <header class="p-4 text-2xl font-bold bg-sky-500/50 shadow-lg">SARE Motor Control</header>

      <main class="p-4 grow flex gap-4 flex-col overflow-y-scroll hide-scrollbar">
        <Connection/>
        <Controls/>
        <Channels/>
        <Modal.ModalComp/>
      </main>

      <footer class="p-4 flex justify-end">v0.0.1</footer>
    </div>
  );
}

function App() {
  return (
    <div class="w-screen h-screen grid place-items-center min-w-[400px]">
      <div class="bg-sare-512 w-1/5 aspect-square bg-cover brightness-0 opacity-30 g-layer min-w-[300px] pointer-events-none -z-40"/>
      <RootBlock/>
    </div>
  );
}

export default App;
