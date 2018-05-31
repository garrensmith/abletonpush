import WebMidi from 'webmidi';
import range from 'lodash.range';
import eventemitter from 'eventemitter2';
import {
  getNoteOctave,
  inScale,
  isRootNote,
  numCols,
  notePads,
  padPosition,
  sortNotesToScale,
  determineChord
} from './music';

const pushId = [0, 33, 29];
const padStartVal = 36;
const rootNoteColor = 126; // green
const inScaleColor = 127; // red
const defaultColor = 123; // dark gray
const pressedColor = 122;

export const buttonColors = {
  red: 127,
  green: 126,
  blue: 125,
  lightgray: 124,
  darkgray: 123,
  white: 122,
  lightpurple: 20,
  purple: 18,
  greenblue: 16,
  teal: 12,
  limegreen: 7,
  yellow: 3
};

const log = (...args) => {
  if (log.enabled) {
    // eslint-disable-next-line
    console.log.apply(console, args);
  }
};

log.enable = false;

export default class Push extends eventemitter {
  constructor ({logging = true}) {
    super();
    log.enabled = logging;
    this.activePads = [];
    this.batchCommands = []; // batch commands in case something is called before web midi is enabled
    this.midiEnabled = false;
    this.pushConnected = false;

    WebMidi.enable((err) => {
      if (err) {
        log('WebMidi could not be enabled.');
        return;
      }
      
      this.midiEnabled = true;
      log('WebMidi enabled!');

      WebMidi.addListener('connected', (...args) => {
        if (this.pushConnected) {
          return;
        }
        this.pushConnected = true;
        this.setupPush();
        log('CONNECTED', args);
        this.emit('push:connected');
      });

      WebMidi.addListener('disconnected', (...args) => {
        this.pushConnected = false;
        this.emit('push:disconnected');
        log('disconnected', args);
      });
    }, true);
  }

  setupPush () {
    const push = this;
    push.output = WebMidi.getOutputByName('Ableton Push 2 User Port');
    push.input = WebMidi.getInputByName('Ableton Push 2 User Port');
    if (!push.input || !push.output) {
      log('push not connected');
      push.emit('push:failed');
      return;
    }

    push.input.addListener('sysex', 'all', (e) => {
      log('sysex', e);
    });

    // Listen to control change message on all channels
    push.input.addListener('controlchange', 'all', (e) => {
      log('Received \'controlchange\' message.', e);
      if (e.controller) {
        const name = e.controller.name;
        const number = e.controller.number;
        const moveData = e.data[2];
        let  movement = {};
        if (moveData > 63) {
          movement = {
            direction: 'left',
            amount: 128 - moveData
          };
        } else  {
          movement = {
            direction: 'right',
            amount: moveData
          };
        }
        push.emit(`push:encoder:${name}`, movement);
        push.emit(`push:encoder:${number}`, movement);
      }
    });

    push.setToUserMode();
    push.showIsomorphicScale();

    if (this.batchCommands.length > 0) {
      this.batchCommands.forEach(command => {
        this.output.send.apply(this.output, command);
      });

      this.batchCommands = [];
    }

    push.input.addListener('noteon', 'all', (e) => {
      const pad = e.data[1];
      if (pad < 20) {
        return; // not a pad
      }
      const {col, row} = padPosition(pad);
      const notePressed = getNoteOctave(row, col);

      this.emit('note:on', notePressed);
      log('NOTE PRESSED', notePressed);
      push.padPressed(notePressed);
    });

    push.input.addListener('noteoff', 'all', (e) => {
      const {col, row} = padPosition(e.data[1]);
      const noteReleased = getNoteOctave(row, col);

      this.emit('note:off', noteReleased);
      log('NOTE RELEASED', noteReleased);
      push.padReleased(noteReleased);
    });
  }

  setToUserMode () {
    this.output.sendSysex(pushId, [1, 1, 10, 1]);
  }

  setPadColor (row, col) {
    let padColor = defaultColor;
    const padVal = col + padStartVal + row * numCols;

    const {note} = getNoteOctave(row, col);

    if (inScale(note)) {
      padColor = inScaleColor;
    }

    if (isRootNote(note)) {
      padColor = rootNoteColor;
    }
    this.output.send(144, [padVal, padColor], 0);
  }

  showIsomorphicScale () {
    range(0, 8).forEach(row => {
      range(0, 8).forEach(col => {
        this.setPadColor(row, col);
      });
    });
  }

  padReleased ({note, octave}) {
    const key = `${note}-${octave}`;

    if (!notePads.has(key)) {
      return;
    }
    const indexOf = this.activePads.findIndex(({note: padNote, octave: padOctave}) => {
      return padNote === note && padOctave === octave;
    });

    if (indexOf !== -1) {
      this.activePads.splice(indexOf, 1);
    }

    const chord = determineChord(this.activePads);
    if (chord !== null) {
      log('PLAYING CHORD RELEASE', chord);
      this.emit('push:chord', chord);
    }

    notePads.get(key).forEach(({row, col}) => {
      this.setPadColor(row, col);
    });
  }

  padPressed ({note, octave}) {
    const key = `${note}-${octave}`;
    this.activePads.push({note, octave});
    this.activePads.sort(sortNotesToScale);

    log('PRESSED', note, this.activePads);
    const chord = determineChord(this.activePads);
    if (chord !== null) {
      log('PLAYING CHORD PRESS', chord);
      this.emit('push:chord', chord);
    }

    if (!notePads.has(key)) {
      return;
    }

    notePads.get(key).forEach(({pad}) => {
      this.output.send(144, [pad, pressedColor], 0);
    });
  }

  
  setColourButtons (button, color) {
    if (!this.pushConnected) {
      this.batchCommands.push([176, [button, color], 0]);
      return;
    }
    this.output.send(176, [button, color], 0);
  }
}
