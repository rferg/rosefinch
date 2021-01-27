import { Injectable } from 'cewdi'
import { DurationDenomination } from '../../common/duration-denomination'
import { PlayableNote } from '../playable-note'
import { DenominatedNote } from './denominated-note'

@Injectable()
export class MeasureSplitter {
    private readonly sortedWholeRhythmDenominations: DurationDenomination[] = [ 16, 8, 4, 2, 1 ]

    splitMeasures({
        sequence,
        timeSignature,
        shortestNoteDuration
    }: {
        sequence: PlayableNote[],
        timeSignature: [number, DurationDenomination ],
        shortestNoteDuration: DurationDenomination
    }): DenominatedNote[][] {
        return this.splitIntoMeasures(sequence, shortestNoteDuration, timeSignature)
    }

    private splitDurationIntoDenominations(
        numberOfSixteenths: number,
        firstMax?: number,
        totalMax?: number): DurationDenomination[] {
            const denominations: DurationDenomination[] = []
            while (numberOfSixteenths > 0) {
                const denomination = this.getLargestWholeRhythmDenomination(
                    numberOfSixteenths,
                    denominations.length ? totalMax : firstMax)
                denominations.push(denomination)
                numberOfSixteenths -= denomination
            }
            return denominations
    }

    private splitIntoMeasures(
        notes: PlayableNote[],
        shortestNoteDuration: DurationDenomination,
        timeSignature: [ number, DurationDenomination ]): DenominatedNote[][] {
            const sixteenthsPerMeasure = this.getSixteenthNotesPerMeasure(timeSignature)
            let currentMeasure: DenominatedNote[] = []
            let currentMeasureCount = 0
            const result: DenominatedNote[][] = []
            notes.forEach((note, i) => {
                const denominations = this.splitDurationIntoDenominations(
                    this.getDurationInSixteenthNotes(shortestNoteDuration, note.numberOfShortestDurations),
                    sixteenthsPerMeasure - currentMeasureCount,
                    sixteenthsPerMeasure)
                while (denominations.length) {
                    const denomination = denominations.shift() as DurationDenomination
                    if (denomination <= (sixteenthsPerMeasure - currentMeasureCount)) {
                        if (currentMeasure.length
                            && currentMeasure[currentMeasure.length - 1].originalNoteIndex === i) {
                            currentMeasure[currentMeasure.length - 1].duration += denomination
                        } else {
                            currentMeasure.push({
                                pitch: note.pitch,
                                octave: note.octave,
                                duration: denomination,
                                originalNoteIndex: i
                            })
                        }
                        currentMeasureCount += denomination
                        if (currentMeasureCount === sixteenthsPerMeasure) {
                            result.push(currentMeasure)
                            currentMeasure = []
                            currentMeasureCount = 0
                        }
                    } else {
                        denominations.unshift(...this.splitDurationIntoDenominations(
                            denomination,
                            sixteenthsPerMeasure - currentMeasureCount,
                            sixteenthsPerMeasure
                        ))
                    }
                }
            })
            return result
    }

    private getLargestWholeRhythmDenomination(
        numberOfSixteenths: number,
        max?: number): DurationDenomination {
            const allowedDenominations = this.sortedWholeRhythmDenominations.filter(d => !max || d <= max)
            for (const denomination of allowedDenominations) {
                if (numberOfSixteenths - denomination >= 0) {
                    return denomination
                }
            }
            throw new Error('Invalid number of sixteenths encountered!')
    }

    private getSixteenthNotesPerMeasure([ topTime, bottomTime ]: [ number, DurationDenomination ]): number {
        return this.getDurationInSixteenthNotes(bottomTime, topTime)
    }

    private getDurationInSixteenthNotes(
        shortestNoteDuration: DurationDenomination,
        numberOfShortestDurations: number): number {
            return Math.floor(16 / shortestNoteDuration) * numberOfShortestDurations
    }
}
