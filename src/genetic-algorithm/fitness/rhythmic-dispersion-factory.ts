import { Population } from '../population'
import { GeneUtil } from '../../common/gene-util'
import { Uint8 } from '../../common/uint8'
import { Pitch } from '../../common/pitch'

/**
 * Returns a fitness function that computes
 * the index of dispersion (i.e., variance-to-mean ratio) over note durations
 * and then evaluates the distance of this from the given target.
 * This is computed as:
 *
 *  fitness = -Math.round((actualDifference / maxPossibleDifference) * 100)
 *
 * where the maxPossibleDifference is 4 - target, since we will
 * cap the index of dispersion at 4.
 * @param Options.target integer value between 0 and 2 inclusive
 * @returns fitness function for rhythmic dispersion
 */
export function rhythmicDispersionFactory({
    target
}: {
    target: 0 | 1 | 2
}): (population: Population) => Int8Array {
    const maxIndexValue = 4
    const maxDifference = maxIndexValue - target
    return (population: Population) => {
        const results = new Int8Array(population.size)
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            const indexOfDispersion = getIndexOfDispersion(genome)
            const difference = Math.min(Math.abs(indexOfDispersion - target), maxDifference)
            results[genomeIndex] = -Math.round((difference / maxDifference) * 100)
        }

        return results
    }
}

function getNoteDurations(genome: Uint8Array): number[] {
    return genome.reduce((result, current) => {
        const pitch = GeneUtil.getPitch(current as Uint8)
        if (pitch === Pitch.Hold && result.length) {
            result[result.length - 1] += 1
        } else {
            result.push(1)
        }
        return result
    }, [] as number[])
}

function getMean(data: number[]): number {
    if (!data.length) { return 0 }
    const sum = data.reduce((result, current) => result + current, 0)
    return sum / data.length
}

function getVariance(data: number[], mean: number): number {
    if (data.length <= 1) { return 0 }
    const sumOfSquares = data.reduce((result, current) => result + ((current - mean) ** 2), 0)
    return sumOfSquares / (data.length - 1)
}

function getIndexOfDispersion(genome: Uint8Array): number {
    const noteDurations = getNoteDurations(genome)
    if (noteDurations.length <= 1) {
        return 0
    }
    const mean = getMean(noteDurations)
    const variance = getVariance(noteDurations, mean)
    return variance / mean
}
