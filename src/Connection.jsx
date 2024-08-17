import { createSignal, onMount } from "solid-js";
import brdConn from "./brdConn";

const [connDetails, setConnDetails] = createSignal(null);
const [isConnected, setIsConnected] = createSignal(false);
const [isPending, setIsPending] = createSignal(false);

function onStartConnect() {
  navigator.serial.requestPort()
  .then(port => brdConn.connect(port))
  .then(details => setConnDetails(details))
  .catch(error => console.error(error));
}

function updateLoop() {
  setIsConnected(brdConn.isConnected());
  setIsPending(brdConn.isPending());

  window.requestAnimationFrame(updateLoop);
}

function Connection() {

  const hasSerialAPI = navigator.serial ? true : false;

  onMount(() => {
    window.requestAnimationFrame(updateLoop);
  });

  return (
    <div>
      <h2 class="text-xl">Connection</h2>
      <hr class="mb-2"></hr>
      <div>
        <p>Serial API: {hasSerialAPI ? "Available" : "Not Available"}</p>
        {hasSerialAPI ? (
          <div class="bg-003">
            <div class="bg-001 p-3 text-xl font-bold flex gap-3 p-2 items-center justify-between">
              { isPending() && isConnected() ? (
                <>
                <div class="flex gap-2 items-center">Connecting<i class="fa-solid fa-circle text-yellow-500 text-xs"></i></div>
                <button class="bg-black text-slate-500 p-2 rounded text-base pointer-events-none">
                  Connect
                </button>
                </>) :
                isConnected() ? (
                <>
                <div class="flex gap-2 items-center">Connected<i class="fa-solid fa-circle text-green-500 text-xs"></i></div>
                <button class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors text-base"
                onClick={() => {brdConn.disconnect(); setConnDetails(null)}}>
                  Disconnect
                </button>
                </>) : (
                <>
                <div class="flex gap-2 items-center">Not Connected<i class="fa-solid fa-circle text-red-500 text-xs"></i></div>
                <button class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors text-base"
                onClick={onStartConnect}>
                  Connect
                </button>
                </>)}
            </div>
            <div class="flex max-[558px]:flex-col">
              <div class="bg-001 p-1 flex justify-center max-[558px]:order-2"><div class={`bg-uno-board aspect-[0.75] bg-contain bg-center bg-no-repeat min-[558px]:w-[2.25in] max-[558px]:h-[2in] min-[558px]:rotate-90 board-dim transition ${isConnected() ? "board-lit" : "board-dim"}`}/></div>
              <div class="p-3 max-[558px]:order-1 flex flex-col gap-3">
                { connDetails() ? (
                  <div>
                    <p class="text-xl font-bold">Connected to {connDetails()?.board}</p>
                    <p class="text-lg">Firmware: {connDetails()?.firmware}</p>
                    <p>{connDetails()?.message}</p>
                    <button class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors text-base"
                    onClick={brdConn.reset}>
                      Reset
                    </button>
                  </div>
                ) : (
                  <>
                  <p>Connect to the Uno Board</p>
                  <p class="">
                    Make sure your Arduino board has the correct firmware installed. Download firmware here: <a class="text-blue-400 underline" href="https://github.com/rgv-sare/motor-control/blob/master/firmware/MotorControl.ino" target="_blank" rel="noreferrer">MotorControl.ino</a>
                  </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) :
        <p class="text-red-400 font-bold bg-003 p-2">Serial API not available. Try using Chrome <i class="fa-brands fa-chrome"></i>, Edge <i class="fa-brands fa-edge"></i>, or Opera <i class="fa-brands fa-opera"></i> on a desktop or laptop.</p>}
      </div>
    </div>
  );
}

export default Connection;