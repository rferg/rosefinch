export function calculateGenomeSize(
    measures: number,
    [ timeSignatureTop, timeSignatureBottom ]: [number, 1 | 2 | 4 | 8 | 16],
    shortestNoteDuration: 1 | 2 | 4 | 8 | 16): number {
        return Math.floor(measures * timeSignatureTop * (shortestNoteDuration / timeSignatureBottom))
}
