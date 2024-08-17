import { createEffect, onMount } from "solid-js";
import util from "./util";
import mtrCtl from "./mtrCtl";

function Control({channel, onRemove, index, updateControls}) {
  let amou;

  onMount(() => {
    const cFont = util.getCanvasFont(amou);
    const textWidth = util.getTextWidth(amou.textContent, cFont);
    amou.style.transform = `scale(${90.0 / textWidth})`;
  });

  createEffect(() => {
    const a = channel.value.toFixed(2);
    amou.textContent = a;
    const cFont = util.getCanvasFont(amou);
    const textWidth = util.getTextWidth(a, cFont);
    amou.style.transform = `scale(${90.0 / textWidth})`;
  });

  return(
    <div class="bg-003 flex max-[460px]:flex-col">
      <div class="font-code p-3 bg-003 flex items-center justify-center min-[460px]:min-w-[1.49in] min-[460px]:max-w-[1.5in]">
        <span ref={amou} class="font-bold text-[50px] transition-transform">--</span>
      </div>
      <div class="grow max-[460px]:order-first">
        <div class={`text-xl font-bold flex gap-3 p-2 bg-001 items-center justify-between ${channel.connected ? "" : "text-red-800"}`}>
          {channel.name}
          <div class="text-base font-medium flex gap-1 items-center shrink-0">
            <span class="bg-black text-white p-1 rounded">{channel.controlName}</span>
          </div>
        </div>

        <div class="p-3 flex justify-between">
          <div class="flex flex-col gap-1">
            <span>Raw Value: {channel.rawValue.toFixed(2)}</span>
            <span>Mapping</span>
          </div>
          <div class="flex flex-col justify-between items-end">
            <button class="bg-black text-white p-3 rounded hover:bg-zinc-800 active:bg-zinc-600 transition-colors aspect-square flex justify-center items-center"
            onClick={() => onRemove(channel)}>
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
        <input class="m-3 mt-0 bg-003 block p-1 wtf-01 box-border" value={channel.mapping} type="text"
        onInput={(e) => {
          const control = mtrCtl.getControl(channel.uuid);
          control.setMapping(e.target.value);
          updateControls(index, "mapping", e.target.value);
          updateControls(index, "mappingMessage", control.mappingMessage);
        }}></input>
        {channel.mappingMessage ? <div class="text-red-800 px-3 pb-3">{channel.mappingMessage}</div> : null}
      </div>
    </div>
  );
}

export default Control;