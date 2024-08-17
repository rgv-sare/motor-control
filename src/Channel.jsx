import { onMount, createEffect } from "solid-js";
import util from "./util";
import mtrCtl from "./mtrCtl";

function Channel({channel, index, updateChannels, onRemove}) {
  let perc;

  onMount(() => {
    const cFont = util.getCanvasFont(perc);
    const textWidth = util.getTextWidth(perc.textContent, cFont);
    perc.style.transform = `scale(${90.0 / textWidth})`;
  });

  let a = 0.0;

  createEffect(() => {
    perc.textContent = Math.round(channel.value * 100).toString() + "%";
    const cFont = util.getCanvasFont(perc);
    const textWidth = util.getTextWidth(perc.textContent, cFont)
    perc.style.transform = `scale(${90.0 / textWidth})`;

  });

  return(
    <div class="bg-003 flex max-[460px]:flex-col">
      <div class="font-code p-3 bg-003 flex items-center justify-center min-[460px]:min-w-[1.5in] min-[460px]:max-w-[1.5in]">
        <span ref={perc} class="font-bold text-[50px] transition-transform">--</span>
      </div>
      <div class="grow max-[460px]:order-first">
        <div class="text-xl font-bold flex gap-3 p-2 bg-001 items-center justify-between">
          {channel.name}
          <div class="text-base font-medium flex gap-1 items-center shrink-0">
            <span class={`bg-black p-1 rounded ${channel.value > 0.5 ? "text-black" : "text-white"}`} style={`background-color: rgb(${Math.round(channel.value * 255)}, ${Math.round(channel.value * 255)}, ${Math.round(channel.value * 255)})`}>{channel.analogPin}</span>
            |
            <span class={`bg-black p-1 rounded ${channel.positivePinValue > 0.5 ? "text-black" : "text-white"}`} style={`background-color: rgb(${Math.round(channel.positivePinValue * 255)}, ${Math.round(channel.positivePinValue * 255)}, ${Math.round(channel.positivePinValue * 255)})`}>{channel.positivePin}</span>
            |
            <span class={`bg-black p-1 rounded ${channel.negativePinValue > 0.5 ? "text-black" : "text-white"}`} style={`background-color: rgb(${Math.round(channel.negativePinValue * 255)}, ${Math.round(channel.negativePinValue * 255)}, ${Math.round(channel.negativePinValue * 255)})`}>{channel.negativePin}</span>
          </div>
        </div>

        <div class="p-3 flex justify-between">
          <div class="flex flex-col gap-1">
            <span>Value: {channel.value.toFixed(2)}</span>
            <span>PWM: {Math.round(channel.value * 255)}</span>
            <span>Direction: <i class={`fa-solid fa-${channel.direction == 0 ? "o" : channel.direction == 1 ? "arrow-rotate-right" : "arrow-rotate-left"}`}></i></span>
            <span>Mapping (Clamped)</span>
          </div>
          <div class="flex flex-col justify-between items-end">
            <button class="bg-black text-white p-2 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors"
            onClick={() => {
              const chan = mtrCtl.getChannel(channel.uuid);
              chan.flipDirection = !chan.flipDirection;
              updateChannels(index, "flipDirection", chan.flipDirection);
            }}>
              Direction <i class={`fa-solid fa-arrow-rotate-${channel.flipDirection ? "left" : "right"}`}></i>
            </button>

            <button class="bg-black text-white p-3 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors aspect-square flex justify-center items-center"
            onClick={() => onRemove(channel)}>
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <input class="m-3 mt-0 bg-003 block p-1 wtf-01 box-border" type="text" value={channel.mapping}
        onInput={(e) => {
          const chan = mtrCtl.getChannel(channel.uuid);
          chan.setMapping(e.target.value);
          updateChannels(index, "mapping", e.target.value);
          updateChannels(index, "mappingMessage", chan.mappingMessage);
        }}></input>
        {channel.mappingMessage ? <div class="text-red-800 px-3 pb-3">{channel.mappingMessage}</div> : null}
      </div>
    </div>
  );
}

export default Channel;