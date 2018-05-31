import {
  sortNotesToScale, 
  determineChord
} from '../music';

describe('Music', () => {

  describe('notes sorter', () => {

    it('sorts notes correctly in same octave', () => {
      const notes = [{
        note: 'A',
        octave: '3'
      }, {
        note: 'B',
        octave: '3'
      }, {
        note: 'C',
        octave: '3'
      }];

      const sortedNotes = [{
        note: 'C',
        octave: '3'
      }, {
        note: 'A',
        octave: '3'
      }, {
        note: 'B',
        octave: '3'
      }];

      notes.sort(sortNotesToScale);
      expect(notes).toEqual(sortedNotes)
    });

    it('sorts notes correctly in different octave', () => {
      const notes = [{
        note: 'A',
        octave: '3'
      }, {
        note: 'B',
        octave: '5'
      }, {
        note: 'C',
        octave: '4'
      }];

      const sortedNotes = [{
        note: 'A',
        octave: '3'
      }, {
        note: 'C',
        octave: '4'
      }, {
        note: 'B',
        octave: '5'
      }];

      notes.sort(sortNotesToScale);
      expect(notes).toEqual(sortedNotes)
    });
  });

  describe('chord calculator', () => {

    it('determines I chord', () => {
      const notes = [{
        note: 'C',
        octave: '4' 
      }, {
        note: 'E',
        octave: '4'
      }, {
        note: 'G',
        octave: '4'
      }];

      expect(determineChord(notes)).toEqual({
        chord: 'C',
        octave: '4',
        roman: 'I',
        type: 'major'
      });
    });

    it('determines vi chord', () => {
      const notes = [{
        note: 'A',
        octave: '3' 
      }, {
        note: 'C',
        octave: '4'
      }, {
        note: 'E',
        octave: '4'
      }];

      expect(determineChord(notes)).toEqual({
        chord: 'A',
        octave: '3',
        roman: 'vi',
        type: 'minor'
      });
    });

    it('returns null for no 5th note', () => {
      const notes = [{
        note: 'A',
        octave: '3' 
      }, {
        note: 'C',
        octave: '4'
      }];

      expect(determineChord(notes)).toBeNull();
    });

    it('returns null for no 5th note', () => {
      const notes = [{
        note: 'C',
        octave: '3' 
      }, {
        note: 'C#',
        octave: '4'
      }, {
        note: 'G',
        octave: '4'
      }];

      expect(determineChord(notes)).toBeNull();
    });

    it('returns null for no 5th note', () => {
      const notes = [{
        note: 'A',
        octave: '3' 
      }, {
        note: 'C',
        octave: '4'
      }, {
        note: 'F',
        octave: '4'
      }];

      expect(determineChord(notes)).toBeNull();
    });

    it('returns null for extra note', () => {
      const notes = [{
        note: 'A',
        octave: '3' 
      }, {
        note: 'C',
        octave: '4'
      }, {
        note: 'E',
        octave: '4'
      }, {
        note: 'F',
        octave: '4'
      }];

      expect(determineChord(notes)).toBeNull();
    });
  });
});
