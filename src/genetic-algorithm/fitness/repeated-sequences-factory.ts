import { GeneUtil } from '../../common/gene-util'
import { Pitch } from '../../common/pitch'
import { Uint8 } from '../../common/uint8'
import { Population } from '../population'

export interface RepeatedSequencesOptions {
    minLength: number,
    type: SequenceType
}

export enum SequenceType {
    Pitch,
    Rhythm
}

export function repeatedSequencesFactory(options: RepeatedSequencesOptions[]): (population: Population) => Int8Array {
    return (population: Population) => {
        const results = new Int8Array(population.size)

        options.forEach(({
            minLength,
            type
        }) => {
            if (minLength < 2) {
                throw new Error('minLength and maxLength must be >= 2')
            }
            if (minLength >= population.genomeSize) {
                throw new Error('minLength cannot be >= genomeSize')
            }

            for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
                const genome = population.get(genomeIndex)
                const encodedGenome = encodeGenome(genome, type)
                const maxPossibleScore = getMaxScore(minLength, encodedGenome.length)
                const score = getScore(encodedGenome, minLength)
                const normalizedScore = (score / maxPossibleScore) * 100
                const fitness = Math.round(normalizedScore / options.length)
                results[genomeIndex] += fitness
            }
        })

        return results
    }
}

function getMaxScore(minLength: number, encodedGenomeLength: number): number {
    return getSumOfNumbersUpToN(encodedGenomeLength - 1) - getSumOfNumbersUpToN(minLength - 1)
}

function getSumOfNumbersUpToN(n: number): number {
    return (n * (n + 1)) / 2
}

function getScore(encodedGenome: number[], minLength: number): number {
    const lcpArray = getLcpArray(encodedGenome)
    return lcpArray
        .filter(prefixLength => minLength <= prefixLength)
        .reduce((prev, curr) => prev + curr, 0)
}

function encodeGenome(genome: Uint8Array, type: SequenceType): number[] {
    if (type === SequenceType.Pitch) {
        return Array.from(genome.map(gene => GeneUtil.getPitch(gene as Uint8)))
            .filter(pitch => pitch !== Pitch.Hold)
    }
    if (type === SequenceType.Rhythm) {
        return getRhythms(genome)
    }

    throw new Error(`Invalid sequence type ${type}`)
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

// We use naive, slow approach.
// If necessary, we can optimize further using Kasai algorithm.
function getLcpArray(encodedGenome: number[]): number[] {
    const suffixArray = getSuffixArray(encodedGenome)
    const lcp = []
    for (let suffixIndex = 0; suffixIndex < suffixArray.length; suffixIndex++) {
        let commonPrefixLength = 0
        if (suffixIndex) {
            const previous = encodedGenome.slice(suffixArray[suffixIndex - 1])
            const current = encodedGenome.slice(suffixArray[suffixIndex])
            for (let itemIndex = 0; itemIndex < current.length; itemIndex++) {
                if (previous[itemIndex] !== current[itemIndex]) {
                    break
                }
                commonPrefixLength++
            }
        }
        lcp.push(commonPrefixLength)
    }
    return lcp
}

// We use a naive, slow approach to constructing suffix array.
// If this is causing performance issues, we can optimize further (to O(n))
function getSuffixArray(encodedGenome: number[]): number[] {
    const suffixes: { suffix: number[], index: number }[] = []
    for (let i = 0; i < encodedGenome.length; i++) {
        suffixes.push({ index: i, suffix: encodedGenome.slice(i) })
    }
    suffixes.sort((a, b) => sortArraysOfNumbers(a.suffix, b.suffix))
    return suffixes.map(({ index }) => index)
}

function sortArraysOfNumbers(a: number[], b: number[]): number {
    const length = a.length > b.length ? a.length : b.length
    for (let i = 0; i < length; i++) {
        if (i >= b.length) { return 1 }
        if (i >= a.length) { return -1 }
        const aElement = a[i]
        const bElement = b[i]
        if (aElement === bElement) {
            continue
        }
        return aElement - bElement
    }
    return 0
}
