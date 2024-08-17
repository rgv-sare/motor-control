#define READ_ZEROS 0
#define READ_CMD 1
#define READ_PARAMS 2

struct MotorChannel {
  uint8_t analogPin;
  uint8_t positivePin;
  uint8_t negativePin;
};

uint8_t numChannels = 0;
MotorChannel channels[4];

uint8_t getNumParams(uint8_t cmd) {
  if(cmd < 128)
    return cmd * 3;
  
  return 3;
}

void resetPins() {
  for (int pin = 2; pin <= 13; pin++) {
    pinMode(pin, INPUT);
  }
}

void execCmd(uint8_t cmd, uint8_t* params) {
  if(cmd < 5) { // Reset CMD
    resetPins();

    numChannels = cmd;
    for(int i = 0; i < cmd; i++) {
      channels[i].analogPin = params[i * 3];
      pinMode(channels[i].analogPin, OUTPUT);
      channels[i].positivePin = params[i * 3 + 1];
      pinMode(channels[i].positivePin, OUTPUT);
      channels[i].negativePin = params[i * 3 + 2];
      pinMode(channels[i].negativePin, OUTPUT);
    }

    Serial.println("ACK OK. ArduinoUno MotorControl-v1.0");
  } else if(128 <= cmd && cmd < (128 + numChannels)) {
    MotorChannel& channel = channels[cmd - 128];
    analogWrite(channel.analogPin, params[0]);
    digitalWrite(channel.positivePin, params[1]);
    digitalWrite(channel.negativePin, params[2]);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(13, OUTPUT);
}

uint8_t readStatus = READ_ZEROS;
uint8_t zerosRead = 0;
uint8_t command = 0;
uint8_t numParams = 0;
uint8_t paramsIndex = 0;
uint8_t paramsBuffer[48] = {};

void loop() {
  while(Serial.available()) {
    uint8_t b = Serial.read();
    // char buf[32] = {0};
    // snprintf(buf, 32, "In: %02d State: %s\n", b, readStatus == 0 ? "ZEROS" : readStatus == 1 ? "CMD" : "PARAMS");
    // Serial.write(buf);
    if(readStatus == READ_ZEROS && b == 0) {
      zerosRead++;
      if(zerosRead == 2) {
        readStatus = READ_CMD;
        paramsIndex = 0;
        continue;
      }
    } else
      zerosRead = 0;

    if(readStatus == READ_CMD) {
      command = b;
      numParams = getNumParams(command);
      if(numParams == 0) {
        execCmd(command, paramsBuffer);
        readStatus = READ_ZEROS;
        continue;
      }
      readStatus = READ_PARAMS;
      continue;
    }

    if(readStatus == READ_PARAMS) {
      paramsBuffer[paramsIndex++] = b;

      if(paramsIndex == numParams) {
        execCmd(command, paramsBuffer);
        readStatus = READ_ZEROS;
        paramsIndex = 0;
      }
    }
  }
}