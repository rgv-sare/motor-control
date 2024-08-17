import mtrCtl from "./mtrCtl";

let port = null;
let pendingConnection = false;
let readBuffer = "";
let recivedLine = null;
let active = false;

async function readLoop () {
  let reader;
  while (true) {
    if (!port) {
      await sleep(50);
      continue;
    }

    try {
      reader = port.readable.getReader();

      const { value, done } = await Promise.race([
        reader.read(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 50))
      ]);
      
      readBuffer += new TextDecoder().decode(value);

      let lines = readBuffer.split("\n");
      readBuffer = lines.pop();

      lines.forEach(line => {
        console.log(line);
        recivedLine = line;
      });

    } catch (e) {
      if (e.message !== 'Timeout')
        try {await reader.cancel();} catch (e) {}
    } finally {
      if (reader)
        try {await reader.releaseLock();} catch (e) {}
    }

    await sleep(50);
  }
};

async function updateLoop() {
  let writer;
  while (true) {
    if (!active) {
      await sleep(50);
      continue;
    }

    try {
      writer = port.writable.getWriter();

      const channels = mtrCtl.getUsedChannels();

      for(let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const signal = [0x0, 0x0, 128 + i, Math.round(channel.value * 255), channel.positivePinValue ? 1 : 0, channel.negativePinValue ? 1 : 0];
        const signalArray = new Uint8Array(signal);

        await writer.write(signalArray);
      }

    } catch (e) {
      console.error(e);
    } finally {
      if (writer)
        try {await writer.releaseLock();} catch (e) {}
    }

    await sleep(50);
  }
}

async function waitForLine() {
  while (!recivedLine)
    await sleep(50);

  const line = recivedLine;
  recivedLine = null;
  return line;
}

readLoop();
updateLoop();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendReset() {
  const channels = mtrCtl.getUsedChannels();
  let resetSignal = [0x0, 0x0, channels.length];

  for(let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const signal = [
      mtrCtl.getBoardPin(channel.analogPin),
      mtrCtl.getBoardPin(channel.positivePin),
      mtrCtl.getBoardPin(channel.negativePin)
    ];
    resetSignal = resetSignal.concat(signal);
  }

  const resetArray = new Uint8Array(resetSignal);
  const writable = port.writable.getWriter();

  await writable.write(resetArray);
  writable.releaseLock();

  const line = await waitForLine();
  const tokens = line.split(" ");
  if (tokens[0] !== "ACK")
    return {
      message: "Unknown Firmware",
      board: "Unknown",
      firmware: "Unknown"
    };

  return {
    message: tokens[1],
    board: tokens[2],
    firmware: tokens[3]
  };
}

async function connect(serialPort) {
  port = serialPort;
  pendingConnection = true;
  await port.open({ baudRate: 115200 });
  await sleep(2000);

  pendingConnection = false;
  active = true;
  const details = await sendReset();

  return details;
}

async function disconnect() {
  const closingPort = port;
  port = null;
  active = false;
  await sleep(200);
  await closingPort.close();
}

async function reset() {
  active = false;
  await sleep(200);
  sendReset();
  active = true;
}

function getSerialPort() {
  return port;
}

function isConnected() {
  return port !== null;
}

function isPending() {
  return pendingConnection;
}

export default {
  connect,
  disconnect,
  getSerialPort,
  isConnected,
  isPending,
  reset
}