import { createStore } from "solid-js/store";
import Channel from "./Channel";
import Modal from "./Modal";
import NewChannel from "./NewChannel";
import mtrCtl from "./mtrCtl";
import { onMount } from "solid-js";

const [channels, setChannels] = createStore(JSON.parse(localStorage.getItem("channels")) || []);
mtrCtl.loadChannels(channels);

function refreshChannels() {
  const channels = mtrCtl.getUsedChannels();

  channels.forEach((channel, index) => {
    channel.update();
    setChannels(index, "value", channel.value);
    setChannels(index, "direction", channel.direction);
    setChannels(index, "positivePinValue", channel.positivePinValue);
    setChannels(index, "negativePinValue", channel.negativePinValue);
  });
  window.requestAnimationFrame(refreshChannels);
}
refreshChannels();

const saveThread = setInterval(() => {
  localStorage.setItem("channels", JSON.stringify(channels));
}, 1000);

const onNewChannel = (e) => {
  const channel = new mtrCtl.OutputChannel(e.name, e.analogPin, e.positivePin, e.negativePin, e.direction, e.mapping);
  setChannels(channels.length, {
    name: channel.name,
    analogPin: channel.analogPin,
    positivePin: channel.positivePin,
    negativePin: channel.negativePin,
    direction: 0,
    mapping: channel.mappingFormula,
    mappingMessage: channel.mappingMessage,
    value: 0.88,
    positivePinValue: 0.22,
    negativePinValue: 0.33,
    flipDirection: false,
    uuid: channel.uuid
  });
};

const newChannelForm = <NewChannel.NewChannelForm onSubmit={onNewChannel} />

function onRemoveChannel(channel) {
  mtrCtl.removeChannel(channel.uuid);
  setChannels(channels.filter((c) => c !== channel));
}

function Channels() {
  const onAdd = () => {
    Modal.setShown(true);
    Modal.setChildren(newChannelForm);
    Modal.setTitle("New Channel");
    NewChannel.reset();
  }

  onMount(() => {
    window.requestAnimationFrame(refreshChannels);
  });

  return (
    <div>
      <h2 class="text-xl">Channels</h2>
      <hr class="mb-2"></hr>
      <div class="flex flex-col gap-2">
        {channels.map((channel, index) => <Channel channel={channel} index={index} updateChannels={setChannels} onRemove={onRemoveChannel}/>)}
        <button class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
        onClick={onAdd}>
          Add <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  )
}

export default Channels;