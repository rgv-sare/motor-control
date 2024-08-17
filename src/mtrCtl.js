// Arduino Uno board definitions
const boardPins = {
  'D0': 0,
  'D1': 1,
  'D2': 2,
  'D3': 3,
  'D4': 4,
  'D5': 5,
  'D6': 6,
  'D7': 7,
  'D8': 8,
  'D9': 9,
  'D10': 10,
  'D11': 11,
  'D12': 12,
  'D13': 13,
  'A0': 14,
  'A1': 15,
  'A2': 16,
  'A3': 17,
  'A4': 18,
  'A5': 19,
  'A6': 20,
};

//Arduino Uno board PWM pins
const pwmPins = ['D3', 'D5', 'D6', 'D9', 'D10', 'D11'];

const NO_DIRECTION = 0;
const POSITIVE_DIRECTION = 1;
const NEGATIVE_DIRECTION = 2;

class ControlChannel {

  name = "";
  controlName = "";
  rawValue = 0;
  value = 0;
  uuid = "";
  connected = false;
  mappingMessage = null;
  mappingFormula = "";
  gamepadIndex = 0;
  gamepadButton = -1;
  gamepadAxis = -1;
  static controls = [];
  static controlsUuidMap = {};

  constructor(name, gamepadIndex, gamepadButton, gamepadAxis, mapping) {
    this.name = name;
    this.gamepadIndex = gamepadIndex;
    this.gamepadButton = gamepadButton;
    this.gamepadAxis = gamepadAxis;
    this.rawValue = 0;
    this.value = 0;
    this.controlName = "GP" + gamepadIndex + " " + (gamepadButton !== -1 ? "Button" + gamepadButton : "Axis" + gamepadAxis);
    this.uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    this.setMapping(mapping);

    ControlChannel.controls.push(this);
    ControlChannel.controlsUuidMap[this.uuid] = this;
  }

  setUuid(uuid) {
    delete ControlChannel.controlsUuidMap[this.uuid];
    this.uuid = uuid;
    ControlChannel.controlsUuidMap[uuid] = this;
  }

  setMapping(formula) {
    try {
      if(formula === "")
        throw new Error("Mapping cannot be empty");

      const newFunc = new Function("Input", "return " + formula);
      if(typeof newFunc(0) !== "number")
        throw new Error("Mapping must return a number");

      this.mapping = newFunc;
      this.mappingFormula = formula;
      this.mappingMessage = null;
    } catch(e) {
      this.mappingMessage = e.message
    }
  }

  remove() {
    const index = ControlChannel.controls.indexOf(this);
    if(index > -1) {
      ControlChannel.controls.splice(index, 1);
    }
    delete ControlChannel.controlsUuidMap[this.uuid];
  }

  update() {
    const gamepad = navigator.getGamepads()[this.gamepadIndex];

    if(!gamepad) {
      this.connected = false;
      return;
    }
    this.connected = true;

    if(this.gamepadAxis !== -1)
      this.rawValue = gamepad.axes[this.gamepadAxis];
    else if(this.gamepadButton !== -1)
      this.rawValue = gamepad.buttons[this.gamepadButton].value;

    this.value = this.mapping(this.rawValue);
  }
}

class OutputChannel {

  static channels = [];
  static channelsUuidMap = {};
  mappingMessage = null;
  mappingFormula = "";
  name = "";
  analogPin = "";
  positivePin = "";
  negativePin = "";
  direction = NO_DIRECTION;
  flipDirection = false;
  value = 0;
  positivePinValue = 0;
  negativePinValue = 0;

  uuid = "";

  constructor(name, analogPin, positivePin, negativePin, direction, mapping) {
    this.name = name;
    this.analogPin = analogPin;
    this.positivePin = positivePin;
    this.negativePin = negativePin;
    this.mappingFormula = mapping;
    this.uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    this.setMapping(mapping);

    OutputChannel.channels.push(this);
    OutputChannel.channelsUuidMap[this.uuid] = this;
  }

  setUuid(uuid) {
    delete OutputChannel.channelsUuidMap[this.uuid];
    this.uuid = uuid;
    OutputChannel.channelsUuidMap[uuid] = this;
  }

  setMapping(formula) {
    const params = ControlChannel.controls.map((control) => control.name);
    const testValues = ControlChannel.controls.map((control) => control.value);

    try {
      if(formula === "")
        throw new Error("Mapping cannot be empty");

      const newFunc = new Function(...params, "return " + formula);
      if(typeof newFunc(...testValues) !== "number")
        throw new Error("Mapping must return a number");

      this.mapping = newFunc;
      this.mappingFormula = formula;
      this.mappingMessage = null;
    } catch(e) {
      this.mappingMessage = e.message
    }
  }

  remove() {
    const index = OutputChannel.channels.indexOf(this);
    if(index > -1) {
      OutputChannel.channels.splice(index, 1);
    }
  }

  update() {
    this.setMapping(this.mappingFormula);
    const values = ControlChannel.controls.map((control) => control.value);

    this.value = this.mapping(...values);

    let val = Math.round(this.value * 255);
    if(this.flipDirection)
      val *= -1;
    if(val < 0) {
      this.direction = NEGATIVE_DIRECTION;
      this.positivePinValue = false;
      this.negativePinValue = true;
    } else if(val > 0) {
      this.direction = POSITIVE_DIRECTION;
      this.positivePinValue = true;
      this.negativePinValue = false;
    } else {
      this.direction = NO_DIRECTION;
      this.positivePinValue = false;
      this.negativePinValue = false;
    }

    this.value = Math.abs(this.value);
    this.value = Math.max(0, Math.min(1, this.value));
  } 


  static usedPins() {
    return OutputChannel.channels.map((channel) => channel.analogPin).concat(OutputChannel.channels.map((channel) => channel.positivePin)).concat(OutputChannel.channels.map((channel) => channel.negativePin));
  }
}

function getPins() {
  return Object.keys(boardPins);
}

function getPWMPins() {
  return pwmPins;
}

function getBoardPin(pin) {
  return boardPins[pin];
}

function getPinName(pin) {
  return Object.keys(boardPins).find((key) => boardPins[key] === pin);
}

function getAvailablePins() {
  const usedPins = OutputChannel.usedPins();
  return Object.keys(boardPins).filter((pin) => !usedPins.includes(pin));
}

function getAvailablePWMPins() {
  const usedPins = OutputChannel.usedPins();
  return pwmPins.filter((pin) => !usedPins.includes(pin));
}

function getUsedChannels() {
  return OutputChannel.channels;
}

function removeChannel(uuid) {
  OutputChannel.channelsUuidMap[uuid].remove();
}

function getChannel(uuid) {
  return OutputChannel.channelsUuidMap[uuid];
}

function getUsedControls() {
  return ControlChannel.controls;
}

function removeControl(uuid) {
  ControlChannel.controlsUuidMap[uuid].remove();
}

function getControl(uuid) {
  return ControlChannel.controlsUuidMap[uuid];
}

function loadChannels(channels) {
  channels.forEach((channel) => {
    const lch = new OutputChannel(channel.name, channel.analogPin, channel.positivePin, channel.negativePin, channel.direction, "0");
    lch.flipDirection = channel.flipDirection;
    lch.value = 0;
    lch.setUuid(channel.uuid);
    lch.setMapping(channel.mapping);
  });
}

function loadControls(controls) {
  controls.forEach((control) => {
    const lcontrol = new ControlChannel(control.name, control.gamepadIndex, control.gamepadButton, control.gamepadAxis, "0");
    lcontrol.value = control.value;
    lcontrol.setUuid(control.uuid);
    lcontrol.setMapping(control.mapping);
  });
}

export default {
  getBoardPin,
  getPins,
  getPWMPins,
  OutputChannel,
  getAvailablePins,
  getAvailablePWMPins,
  getPinName,
  getUsedControls,
  ControlChannel,
  removeControl,
  getControl,
  getChannel,
  removeChannel,
  getUsedChannels,
  loadChannels,
  loadControls
};