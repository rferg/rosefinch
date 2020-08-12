import { RunData } from './run-data'
import { GeneticAlgorithmRunnerOptions } from './genetic-algorithm-runner-options'

export interface DeserializedGeneticAlgorithm {
    id: string,
    runData: RunData,
    runnerOptions: GeneticAlgorithmRunnerOptions
}
