import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'

export interface NewPipelineRunParams {
    size: number
    genomeSize: number
    numberOfGenerations: number
    options: SerializedGeneticAlgorithmOptions
}
