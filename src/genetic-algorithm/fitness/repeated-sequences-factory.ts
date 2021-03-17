import { GeneUtil } from '../../common/gene-util'
import { Pitch } from '../../common/pitch'
import { Uint8 } from '../../common/uint8'
import { Population } from '../population'

interface RepeatedSequencesOptions {
    minLength: number,
    maxLength: number,
    type: SequenceType
}

enum SequenceType {
    Pitch = 1 << 0,
    Rhythm = 1 << 1
}

export function repeatedSequencesFactory({
    minLength,
    maxLength,
    type
}: RepeatedSequencesOptions): (population: Population) => Int8Array {
    return (population: Population) => {
        if (minLength || maxLength < 2) {
            throw new Error('minLength and maxLength must be >= 2')
        }
        if (minLength > maxLength) {
            throw new Error('minLength cannot be greater than maxLength')
        }
        if (maxLength >= population.genomeSize) {
            throw new Error('maxLength cannot be greater than or equal to genomeSize')
        }
        const results = new Int8Array(population.size)
        // Calculate max possible score:
        const maxPossibleScore = getMaxScore(minLength, maxLength)
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            const score = getScore(genome, { minLength, maxLength, type })
            const fitness = Math.round((score / maxPossibleScore) * 100)
            results[genomeIndex] = fitness
        }
        return results
    }
}

function getMaxScore(minLength: number, maxLength: number): number {
    return getSumOfNumbersUpToN(maxLength) - getSumOfNumbersUpToN(minLength - 1)
}

function getSumOfNumbersUpToN(n: number): number {
    return (n * (n + 1)) / 2
}

function getScore(genome: Uint8Array, { minLength, maxLength, type }: RepeatedSequencesOptions): number {
    const encodedGenome = encodeGenome(genome, type)
    // 1.   Construct LCP array according to type
    // 2.   Add values that are length l, where minLength <= l <= maxLength.
    throw new Error('not implemented' + genome + minLength + maxLength + type + encodedGenome)
}

function encodeGenome(genome: Uint8Array, type: SequenceType): number[] {
    if (type === SequenceType.Pitch) {
        return Array.from(genome.map(gene => GeneUtil.getPitch(gene as Uint8)))
    }
    if (type === SequenceType.Rhythm) {
        return getRhythms(genome)
    }

    const rhythms = getRhythms(genome)
    const pitches = Array.from(genome.map(gene => GeneUtil.getPitch(gene as Uint8)))
    return rhythms.map((rhythm, i) => {
        const pitch = pitches[i]
        return mapPairing(pitch, rhythm)
    })
}

function getRhythms(genome: Uint8Array): number[] {
    const grouping = genome.reduce((result, gene, i) => {
        const pitch = GeneUtil.getPitch(gene as Uint8)
        if (pitch === Pitch.Hold && i) {
            result[result.length - 1].units++
        } else {
            result.push({
                pitch,
                units: 1
            })
        }
        return result
    }, [] as { pitch: Pitch, units: number }[])

    let currentGroupingIndex = 0
    let currentGroupingCount = 1
    const results = []
    for (let i = 0; i < genome.length; i++) {
        let currentGrouping = grouping[currentGroupingIndex]
        if (currentGroupingCount > currentGrouping.units) {
            currentGroupingIndex++
            currentGroupingCount = 1
            currentGrouping = grouping[currentGroupingIndex]
        }
        results.push(currentGrouping.units)
        currentGroupingCount++
    }
    return results
}

// see https://stackoverflow.com/a/13871379
function mapPairing(a: number, b: number): number {
    return a >= b ? a * a + a + b : a + b * b
}
