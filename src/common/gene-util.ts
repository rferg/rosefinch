import { Uint8 } from './uint8'
import { Pitch } from './pitch'

/**
 * Class containing static utility methods
 * for working with UInt8 genes that represent notes.
 */
export class GeneUtil {
    static readonly MIN_OCTAVE = 0
    static readonly MAX_OCTAVE = 8
    // Octave length is 12 chromatic notes + 1 for Rest.
    private static readonly OCTAVE_LENGTH = 13

    static getPitch(gene: Uint8): Pitch {
        if (gene === Pitch.Hold) { return Pitch.Hold }
        return gene % this.OCTAVE_LENGTH
    }

    static getOctave(gene: Uint8): number {
        if (gene === Pitch.Hold) { return this.MIN_OCTAVE - 1 }
        const octave = Math.floor(gene / this.OCTAVE_LENGTH)
        if (octave < this.MIN_OCTAVE) { return this.MIN_OCTAVE }
        if (octave > this.MAX_OCTAVE) { return this.MAX_OCTAVE }
        return octave
    }

    static convertToGene(pitch: Pitch, octave: number): Uint8 {
        if (pitch === Pitch.Hold) { return Pitch.Hold }
        const octaveInRange = Math.max(Math.min(octave, this.MAX_OCTAVE), this.MIN_OCTAVE)
        return ((octaveInRange * this.OCTAVE_LENGTH) + pitch) as Uint8
    }
}
