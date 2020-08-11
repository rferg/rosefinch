import { Population } from '../population'

// TODO

enum SequenceType {
    Pitch = 1 << 0,
    Octave = 1 << 1,
    Rhythm = 1 << 2
}

export function repeatedSequencesFactory({
    minLength,
    maxLength,
    type
}: {
    minLength: number,
    maxLength: number,
    type: SequenceType
}): (population: Population) => Int8Array {
    return (population: Population) => {
        const results = new Int8Array(population.size)
        // Calculate max possible score:
            //
        for (let genomeIndex = 0; genomeIndex < population.size; genomeIndex++) {
            const genome = population.get(genomeIndex)

            throw new Error('not implemented' + genome + minLength + maxLength + type)

            // Create LCP array containing values according to SequenceType.

            // Find repeated sequences with length l, where minLength <= l <= maxLength.

            // Sum sequence lengths to get score.

            // Get fitness = Math.round((score / maxPossibleScore) * 100)

            // add fitness to results array
        }
        return results
    }
}
