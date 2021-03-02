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
        const octaveInRange = this.getOctaveInRange(octave)
        return ((octaveInRange * this.OCTAVE_LENGTH) + pitch) as Uint8
    }

    static createAtOctave(pitch: Pitch, octave: number): Uint8 {
        const octaveInRange = this.getOctaveInRange(octave)
        return pitch + (octaveInRange * this.OCTAVE_LENGTH) as Uint8
    }

    static getNextNote(gene: Uint8): Uint8 {
        if (this.isMaxNote(gene)) { return gene }
        let next = gene + 1 as Uint8
        while (!this.isNote(next) && !this.isMaxNote(next)) {
            next++
        }
        return next
    }

    static getPreviousNote(gene: Uint8): Uint8 {
        if (this.isMinNote(gene)) { return gene }
        let previous = gene - 1 as Uint8
        while (!this.isNote(previous) && !this.isMinNote(previous)) {
            previous--
        }
        return previous
    }

    static isNote(gene: Uint8): boolean {
        const pitch = this.getPitch(gene)
        return pitch !== Pitch.Rest && pitch !== Pitch.Hold
    }

    static isMaxNote(gene: Uint8): boolean {
        return gene >= this.MAX_NOTE_VALUE - 1
    }

    static isMinNote(gene: Uint8): boolean {
        return gene <= 1
    }

    private static getOctaveInRange(octave: number): number {
        return Math.max(Math.min(octave, this.MAX_OCTAVE), this.MIN_OCTAVE)
    }
}
