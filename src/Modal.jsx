import { createEffect, createSignal, onMount } from "solid-js";

const [shown, setShown] = createSignal(false);

const [children, setChildren] = createSignal();

const [title, setTitle] = createSignal("Modal");

function ModalComp() {
  let window;
  let backdrop;

  onMount(() => {
    createEffect(() => {
      window.style.transform = shown() ? "scale(1.0)" : "scale(0.0)";
      window.style.opacity = shown() ? "1.0" : "0.0";
      
      if(shown()) {
        backdrop.classList.add("frosted-glass");
        backdrop.classList.add("bg-003");
        backdrop.classList.remove("pointer-events-none");
      } else {
        backdrop.classList.remove("frosted-glass");
        backdrop.classList.remove("bg-003");
        backdrop.classList.add("pointer-events-none");
      }
    });

    backdrop.classList.remove("hidden");
  });

  return (
    <div ref={backdrop} class={`w-screen h-screen top-0 left-0 fixed bg-003 flex justify-center items-center hidden`}>
      <div ref={window} class="bg-555 border border-slate-900 overflow-hidden max-w-full transition"
      onclick={(e) => e.stopPropagation()}>
        <header class="p-2 px-3 text-xl font-bold bg-sky-400/75 shadow-lg flex gap-4 items-center justify-between">
          {title()}
          <button onclick={() => setShown(false)} class="bg-black rounded p-1 aspect-square flex justify-center items-center
          hover:bg-zinc-800 active:bg-zinc-600 transition-colors w-[2rem]">
            <i class="fa-solid fa-xmark relative"></i>
          </button>
        </header>
        <div class="p-3">
          {children()}
        </div>
      </div>
    </div>
  );
}

export default {shown, setShown, ModalComp, children, setChildren, title, setTitle};