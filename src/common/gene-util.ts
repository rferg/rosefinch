import { Uint8 } from './uint8'
import { Pitch } from './pitch'

/**
 * Class containing static utility methods
 * for working with UInt8 genes that represent notes.
 */
export class GeneUtil {
    static readonly MIN_OCTAVE = 0
    static readonly MAX_OCTAVE = 8
    // Octave length is 12 chromatic notes + 1 for Rest + 1 for Hold.
    static readonly OCTAVE_LENGTH = (Pitch.Hold + 1)
    static get MAX_NOTE_VALUE(): Uint8 {
        return (this.MAX_OCTAVE * (this.OCTAVE_LENGTH + 1)) - 1 as Uint8
    }

    static getPitch(gene: Uint8): Pitch {
        return gene % this.OCTAVE_LENGTH
    }

    static getOctave(gene: Uint8): number {
        const octave = Math.floor(gene / this.OCTAVE_LENGTH)
        if (octave < this.MIN_OCTAVE) { return this.MIN_OCTAVE }
        if (octave > this.MAX_OCTAVE) { return this.MAX_OCTAVE }
        return octave
    }

    static convertToGene(pitch: Pitch, octave: number): Uint8 {
        const octaveInRange = Math.max(Math.min(octave, this.MAX_OCTAVE), this.MIN_OCTAVE)
        return ((octaveInRange * this.OCTAVE_LENGTH) + pitch) as Uint8
    }
}
