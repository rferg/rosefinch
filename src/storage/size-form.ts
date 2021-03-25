export interface SizeForm {
    populationSize: number
    timeSignatureTop: number
    timeSignatureBottom: 1 | 2 | 4 | 8 | 16
    measures: number
    shortestNoteDuration: 1 | 2 | 4 | 8 | 16
    octaveMin: number
    octaveMax: number
}
