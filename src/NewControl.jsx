import { createEffect, createSignal, onMount } from "solid-js";
import Modal from "./Modal";

let nextControlId = 1;

const defaultForm = () => {return {
  name: "Channel" + nextControlId,
  gamepadIndex: 0,
  gamepadButton: -1,
  gamepadAxis: -1,
  mapping: "Input"
}};

const [form, setForm] = createSignal(defaultForm());
const [gamepads, setGamepads] = createSignal(navigator.getGamepads());
const [listening, setListening] = createSignal(false);
const [gpControlName, setGpControlName] = createSignal(null);
let selectedGamepad = null;
let prevAxes = [];
let pollIterations = 0;

function reset() {
  setForm(defaultForm());
  setGamepads(navigator.getGamepads());
  setGpControlName(null);
  setListening(false);
  selectedGamepad = null;
  prevAxes = [];
}

function NewControlForm({onSubmit}) {
  return (
    <form class="flex flex-col gap-3" onSubmit={(e) => {
      e.preventDefault();

      Modal.setShown(false);
      nextControlId++;
      onSubmit(form());
    }}>
      <label>Name (No Spaces)</label>
      <input class="bg-003 block p-1" type="text" value={form().name} placeholder="Name" onInput={(e) => setForm({...form(), name: e.target.value.replace(/\s/g, "")})}/>
      <label>Select Gamepad</label>
      <select class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
      onClick={() => setGamepads(navigator.getGamepads())} onInput={(e) => setForm({...form(), gamepadIndex: e.target.value})}>
        {gamepads().map((gamepad, index) => <option value={index}>{gamepad?.id}</option>)}
      </select>

      <label>Gamepad Control</label>
      <button type="button" class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
      onClick={() => {
        if(listening())
          setListening(false);
        else {
          const poll = () => {
            if(!Modal.shown() || (!listening() && pollIterations > 0)) {
              setListening(false);
              prevAxes = [];
              return;
            }
            
            const gamepads = navigator.getGamepads();
            setGamepads(gamepads);
            selectedGamepad = gamepads[form().gamepadIndex];
            if(!selectedGamepad) {
              setListening(false);
              return;
            }

            for (let i = 0; i < selectedGamepad.buttons.length; i++) {
              if(selectedGamepad.buttons[i].pressed) {
                setForm({...form(), gamepadButton: i});
                setListening(false);
                setGpControlName("Button " + i);
                break;
              }
            }

            for (let i = 0; i < selectedGamepad.axes.length; i++) {
              if(Math.abs(selectedGamepad.axes[i] - (prevAxes[i] ? prevAxes[i] : selectedGamepad.axes[i])) > 0.1) {
                setForm({...form(), gamepadAxis: i});
                setListening(false);
                setGpControlName("Axis " + i);
                break;
              }
            }

            prevAxes = [...selectedGamepad.axes];

            if(listening() || pollIterations++ == 0)
              window.requestAnimationFrame(poll);
          };
          
          setListening(true);
          pollIterations = 0;
          window.requestAnimationFrame(poll);
        }}}>
        { listening() ? (<>Listening <i class="fa-solid fa-ear-listen"></i></>) : gpControlName() ? gpControlName() : (<>Listen <i class="fa-solid fa-gamepad"></i></>)}
      </button>

      <label>Mapping Formula</label>
      <input class="bg-003 block p-1" type="text" placeholder="Mapping" value={form().mapping} onInput={(e) => setForm({...form(), mapping: e.target.value})}/>

      <button type="submit" class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors">
        Add <i class="fa-solid fa-plus"></i>
      </button>
    </form>
  );
}

export default {NewControlForm, form, setForm, reset};