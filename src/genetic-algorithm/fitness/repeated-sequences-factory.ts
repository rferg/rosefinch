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
        if (maxLength > population.genomeSize) {
            throw new Error('maxLength cannot be greater than genomeSize')
        }
        const results = new Int8Array(population.size)
        // Calculate max possible score:
        const maxPossibleScore = Math.floor(population.genomeSize / maxLength) * maxLength
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)
            const score = getScore(genome, { minLength, maxLength, type })
            const fitness = Math.round((score / maxPossibleScore) * 100)
            results[genomeIndex] = fitness
        }
        return results
    }
}

function getScore(genome: Uint8Array, { minLength, maxLength, type }: RepeatedSequencesOptions): number {
    // 1.   Create suffix tree containing values according to SequenceType (using Ukkonen's algorithm).
    //      some references:
    //               https://www.geeksforgeeks.org/ukkonens-suffix-tree-construction-part-1/
    //               https://github.com/maclandrol/SuffixTreeJS/blob/master/ukkonen.js
    // 2.   Repeated sequences are inner nodes of the suffix tree
    // 3.   Find repeated sequences with length l, where minLength <= l <= maxLength, by traversing tree.
    // 4.   Sum sequence lengths to get score.
    throw new Error('not implemented' + genome + minLength + maxLength + type)
}
