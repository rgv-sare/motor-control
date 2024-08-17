## SARE Motor Control

A client-side web application for controlling DC motors with a gamepad. It is built with [SolidJS](https://solidjs.com) and [Vite](https://vitejs.dev).

Access this app at [motorcontrol.rgv-sare.org](https://motorcontrol.rgv-sare.org).

![Screenshot](/screenshots/Screenshot%20from%202024-08-17%2010-58-40.png)

### Features

* Connects to Arduino via Web Serial API
* Control DC motors with a gamepad
* Monitor motor speed and direction
* Customize control and channel mapping

## Usage
You must use a browser that supports the Web Serial API. Currently, only Chrome and Edge support this API. You must also have a gamepad connected to your computer.

Have your Arduino installed with the [SARE Motor Control firmware](/firmware/MotorControl.ino). Connect your Arduino to your computer via USB, and click the "Connect" button in the app. On successful connection, the app will display the firmware version and board information.
