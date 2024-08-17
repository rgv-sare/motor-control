import { createEffect, createSignal, onMount } from "solid-js";
import mtrCtl from "./mtrCtl";
import Modal from "./Modal";

let nextChannelId = 1;

const defaultForm = () => {return {
  name: "Channel" + nextChannelId,
  analogPin: mtrCtl.getPWMPins()[0],
  positivePin: mtrCtl.getPins()[0],
  negativePin: mtrCtl.getPins()[0],
  direction: false,
  mapping: "0"
}};

const [form, setForm] = createSignal(defaultForm());
const [resetCount, setResetCount] = createSignal(0);


function reset() {
  setForm(defaultForm());
  setResetCount(resetCount() + 1);
}

function NewChannelForm({onSubmit}) {
  let analogPinInput;
  let positivePinInput;
  let negativePinInput;

  onMount(() => {
    createEffect(() => {
      const form = defaultForm();
      const s = resetCount();
      if(analogPinInput) {
        analogPinInput.value = form.analogPin;
        positivePinInput.value = form.positivePin;
        negativePinInput.value = form.negativePin;
      }
    })
  });

  return (
    <form class="flex flex-col gap-3" onSubmit={(e) => {
      e.preventDefault();

      const theForm = form();
      if(theForm.analogPin === theForm.positivePin || theForm.analogPin === theForm.negativePin || theForm.positivePin === theForm.negativePin) {
        alert("Pins must be unique");
        return;
      }

      Modal.setShown(false);
      nextChannelId++;
      onSubmit(theForm);
    }}>
      <label>Name</label>
      <input class="bg-003 block p-1" type="text" value={form().name} placeholder="Name" onInput={(e) => setForm({...form(), name: e.target.value})}/>

      <div class="grid gap-3 grid-rows-3 grid-cols-3 grid-rows-[auto_auto_auto] gap-y-1">
        <label class="col-span-3">Pins</label>
        <label class="text-center">Analog</label>
        <label class="text-center">Positive</label>
        <label class="text-center">Negative</label>
        <select ref={analogPinInput} class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
        onInput={(e) => setForm({...form(), analogPin: e.target.value})}>
          {mtrCtl.getPWMPins().map((pin) => <option>{pin}</option>)}
        </select>
        <select ref={positivePinInput} class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
        onInput={(e) => setForm({...form(), positivePin: e.target.value})}>
          {mtrCtl.getPins().map((pin) => <option>{pin}</option>)}
        </select>
        <select ref={negativePinInput} class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
        onInput={(e) => setForm({...form(), negativePin: e.target.value})}>
          {mtrCtl.getPins().map((pin) => <option>{pin}</option>)}
        </select>
      </div>

      <label>Mapping</label>
      <input class="bg-003 block p-1" type="text" value={form().mapping} placeholder="Mapping" onInput={(e) => setForm({...form(), mapping: e.target.value})}/>

      <button type="submit" class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors">
        Add <i class="fa-solid fa-plus"></i>
      </button>
    </form>
  );
}

export default {NewChannelForm, form, setForm, reset};