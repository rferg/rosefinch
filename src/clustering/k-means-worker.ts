import { SerializedPopulation } from '../genetic-algorithm'
import { ClusterResult } from './cluster-result'
import { KMeans } from './k-means'

export class KMeansWorker {

    constructor(
        private readonly populationTransformer: (population: SerializedPopulation) => number[][],
        private readonly kMeans: KMeans) {

    }

    execute({
        population,
        numberOfCentroids,
        stopThreshold,
        maxIterations,
        progressTracker
    }: {
        population: SerializedPopulation,
        numberOfCentroids: number,
        stopThreshold: number,
        maxIterations: number,
        progressTracker: (iteration: number) => void
    }): ClusterResult {
        const data = this.populationTransformer(population)

        return this.kMeans.cluster(data, numberOfCentroids, stopThreshold, { maxIterations, progressTracker })
    }
}
