import { GeneticAlgorithmDeserializer } from './genetic-algorithm-deserializer'
import { GeneticAlgorithmRunner } from './genetic-algorithm-runner'
import { SerializedGeneticAlgorithm } from './serialized-genetic-algorithm'
import { RunData } from './run-data'
import { GeneticAlgorithmRunnerOptions } from './genetic-algorithm-runner-options'
import { RunnerProgressReporter } from './runner-progress-reporter'

export class GeneticAlgorithmWorker {
    constructor(
        private readonly deserializer: GeneticAlgorithmDeserializer,
        private readonly runnerFactory: (options: GeneticAlgorithmRunnerOptions) => GeneticAlgorithmRunner) {

    }

    execute(
        serialized: SerializedGeneticAlgorithm,
        numberOfGenerations: number,
        progressReporter: RunnerProgressReporter): RunData {
        const { runData, runnerOptions } = this.deserializer.deserialize(serialized)
        if (!numberOfGenerations) { return runData }

        const runner = this.runnerFactory(runnerOptions)
        return runner.run(numberOfGenerations, runData, progressReporter)
    }
}
