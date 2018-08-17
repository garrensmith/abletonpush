import range from 'lodash.range';
import clone from 'lodash.clone';

export const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const majorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const majorScaleChords = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii'];
export const startOctave = 3;
export const numRows = 8;
export const numCols = 8;
export const padStartVal = 36;
export const rowInterval = 5; // The start position for each row for the scale

export const inScale = (note) => majorScale.indexOf(note) > -1;
export const isRootNote = (note) => note === notes[0];
export const padKey = ({note, octave}) => `${note}-${octave}`;
export const toMidiNote = ({note, octave}) => `${note}${octave}`;

export const getNoteOctave = (row, col) => {
  const start = row * rowInterval;
  let note = start + col;
  let octave = startOctave;

  if (note >= notes.length) {
    // note = 12 -> 12 - 12 * (12 / 12)
    // note = 25 -> 25 - 12 * (25 / 12)
    const section = parseInt(note / notes.length, 10);
    note -= notes.length * section;
    octave += section;
  }

  return {
    note: notes[note],
    octave: octave,
  };
};

const createNotePads = () => {
  const notePads = new Map();
  range(0, 8).forEach(row => {
    range(0,8).forEach(col => {
      const {note, octave} = getNoteOctave(row, col);
      const key = `${note}-${octave}`;
      if (!notePads.has(key)) {
        notePads.set(key, []);
      }

      const pads = notePads.get(key);

      pads.push({
        row,
        col,
        pad: padStartVal + col + (row * numRows)
      });

      notePads.set(key, pads);
    });
  });

  return notePads;
};

export const notePads = createNotePads();

export const padPosition = (pad) => {
  const normPad = pad - padStartVal;
  const row = parseInt(normPad / 8, 10);
  const col = normPad - (8 * row);
  return {
    col,
    row
  };
};

export const sortNotesToScale = ({note: noteA, octave: octaveA}, {note: noteB, octave: octaveB}) => {
  if (octaveA < octaveB) {
    return -1;
  }

  if (octaveA > octaveB) {
    return 1;
  }

  if (notes.indexOf(noteA) < notes.indexOf(noteB)) {
    return -1;
  }

  if (notes.indexOf(noteA) > notes.indexOf(noteB)) {
    return 1;
  }

  return 0;
};

// This is really basic. Only calucaltes major and minor chords
export const determineChord = (chordNotes) => {
  if (chordNotes.length !== 3) {
    return null;
  }
  const [root, third, fifth] = chordNotes;
  let type = 'major';

  // Create the scale with the root note of the chord as 0
  // This way we can determine the distance for the other notes to calculate the relations
  let typeNotes = clone(notes);
  const leftOver = typeNotes.splice(0, typeNotes.indexOf(root.note));
  typeNotes = typeNotes.concat(leftOver);

  if (Math.abs(typeNotes.indexOf(root.note) - typeNotes.indexOf(third.note)) === 3) {
    type = 'minor';
  } else if (Math.abs(typeNotes.indexOf(root.note) - typeNotes.indexOf(third.note)) !== 4) {
    return null;
  }

  if (Math.abs(typeNotes.indexOf(root.note) - typeNotes.indexOf(fifth.note)) !== 7) {
    return null;
  }

  const roman = majorScaleChords[majorScale.indexOf(root.note)];

  return {
    roman,
    chord: root.note,
    type,
    octave: root.octave
  };
};
