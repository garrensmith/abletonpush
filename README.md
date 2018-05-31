# Ableton Push

`abletonpush` is a library for working with the [Ableton Push](https://www.ableton.com/en/push/) in the browser.
It is designed to work with the Ableton Push to play notes and chords in the Isomorphic pad layout. The pad is setup
in C Major scale and each pad pressed will be relative to that.

## Installation

The `abletonpush` module is distributed through npm and is compatible with `webpack` and `browserify`.
You can install it:

```
npm install --save abletonpush
```

## Table Of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Events](#events)
  - [SetColourButtons](#setColourButtons)
- [Logging](#logging)
- [License](#license)

## Usage

`abletonpush` is only designed to run in the browser. It uses the [webmidi](https://github.com/djipco/webmidi) library underneath. Currently only Google Chrome supports webmidi.
With Google Chrome, web midi will work on a localhost port but for a production site will require https.

```js
import AbletonPush from 'abletonpush'

const abletonpush = new AbletonPush();

abletonpush.on('note:on', ({note, octave}) => {
  console.log(`note ${note}:${octave}` was pressed);
});
```

Once the library can connect to an Ableton Push it will colour the pads on the Push so that can be used as an Isomorphic keyboard.

## Events

`abletonpush` is an eventemitter at its core. It sends events for any interaction with the Push device.

Event                  | Description
-----------------------|--------------------------------------------------------------
push:connected         | A push deviced is connected
push:disconnected      | A push deviced is disconnected.
push:failed            | Failed to access the push's inputs and outputs
push:encoder:${name}   | A push encoder with the name has togged in a direction
push:encoder:${number} | A push encoder with the number has togged in a direction
note:on                | A pad has been pressed
note:off               | A pad has been released
push:chord             | A major/minor chord was played (this is very experimental)

## SetColourButtons

This sets the colours for the buttons just below the encoders. This can be used along with the buttonColours variable.

```js
import AbletonPush from 'abletonpush';
import { buttonColors } from 'abletonpush';

const push = new AbletonPush();
push.setColourButtons(102, buttonColors.red);
```

Take a look at [Ableton Push Midi interface](https://github.com/Ableton/push-interface/blob/master/doc/AbletonPush2MIDIDisplayInterface.asc#MIDI%20Mapping) for the correct button numbers;

## Logging

Passing `logging: true` when creating the AbletonPush object will enable logging.

```js
const push - new AbletonPush({logging: true})

## License

Apache license 2.0
