import { messageHandler } from './message-handler'
import { GeneticAlgorithmDeserializer } from './genetic-algorithm-deserializer'
import { getRandom } from './get-random'
import { getRandomInteger } from './get-random-integer'
import { normalizeToInt8Range } from './fitness/normalize-to-int8-range'
import { geneFactoryFactory } from './gene-factory-factory'
import { mutationFunctionFactory } from './mutation/mutation-function-factory'
import { crossoverFunctionFactory } from './crossover/crossover-function-factory'
import { fitnessFunctionFactory } from './fitness/fitness-function-factory'
import { selectionFunctionFactory } from './selection/selection-function-factory'
import { GeneticAlgorithmWorker } from './genetic-algorithm-worker'
import { GeneticAlgorithmRunner } from './genetic-algorithm-runner'

const deserializer = new GeneticAlgorithmDeserializer(
    getRandom,
    getRandomInteger,
    normalizeToInt8Range,
    geneFactoryFactory,
    mutationFunctionFactory,
    crossoverFunctionFactory,
    selectionFunctionFactory,
    fitnessFunctionFactory
)
const worker = new GeneticAlgorithmWorker(deserializer, options => new GeneticAlgorithmRunner(options))

onmessage = (event: MessageEvent) => messageHandler(event, postMessage as (message: any) => void, worker)
