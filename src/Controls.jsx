import { createSignal, on, onMount } from "solid-js";
import { createStore } from "solid-js/store"
import Control from "./Control";
import Modal from "./Modal";
import mtrCtl from "./mtrCtl";
import NewControl from "./NewControl";

const [controls, setControls] = createStore(JSON.parse(localStorage.getItem("controls")) || []);
mtrCtl.loadControls(controls);

const onNewControlSubmit = (e) => {
  const control = new mtrCtl.ControlChannel(e.name, e.gamepadIndex, e.gamepadButton, e.gamepadAxis, e.mapping);
  setControls(controls.length,
  {
    name: control.name,
    rawValue: 0,
    uuid: control.uuid,
    controlName: control.controlName,
    connected: control.connected,
    mapping: control.mappingFormula,
    mappingValid: control.mappingValid,
    mappingMessage: control.mappingMessage,
    value: 7.77,
    gamepadAxis: control.gamepadAxis,
    gamepadButton: control.gamepadButton,
    gamepadIndex: control.gamepadIndex
  });
}

const saveThread = setInterval(() => {
  localStorage.setItem("controls", JSON.stringify(controls));
}, 1000);

const newControl = <NewControl.NewControlForm onSubmit={onNewControlSubmit}/>;

function refreshControls() {
  const controls = mtrCtl.getUsedControls();

  controls.forEach((control, index) => {
    control.update();
    setControls(index, "rawValue", control.rawValue);
    setControls(index, "value", control.value);
    setControls(index, "connected", control.connected);
  });

  window.requestAnimationFrame(refreshControls);
}

function onRemoveControl(channel) {
  mtrCtl.removeControl(channel.uuid);
  setControls(controls.filter((control) => control !== channel));
}

function Controls() {

  onMount(() => {
    window.requestAnimationFrame(refreshControls);
  });

  return (
    <div>
      <h2 class="text-xl">Gamepad Controls</h2>
      <hr class="mb-2"></hr>
      <div class="flex flex-col gap-2">
        {controls.map((control, index) => <Control channel={control} onRemove={onRemoveControl} index={index} updateControls={setControls}/>)}
        <button class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
        onClick={() => {Modal.setChildren(newControl); Modal.setShown(true); Modal.setTitle("Add Control"); NewControl.reset();}}>
          Add <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  )
}

export default Controls;