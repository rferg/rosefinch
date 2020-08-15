import { messageHandler } from './message-handler'
import { KMeans } from './k-means'
import { randomCentroidsFactory } from './random-centroids-factory'
import { getRandomInteger } from '../genetic-algorithm/get-random-integer'
import { GeneUtil } from '../common/gene-util'
import { manhattanDistance } from './manhattan-distance'
import { KMeansWorker } from './k-means-worker'
import { populationTransformer } from './population-transformer'

const kmeans = new KMeans(
    randomCentroidsFactory({ randomGenerator: () => getRandomInteger(0, GeneUtil.OCTAVE_LENGTH) }),
    manhattanDistance
)

const worker = new KMeansWorker(populationTransformer, kmeans)

onmessage = (message: MessageEvent) => messageHandler(message, postMessage as (message: any) => void, worker)
