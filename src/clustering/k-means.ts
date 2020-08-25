import { ClusterResult } from './cluster-result'
import { ClusterAssignment } from './cluster-assignment'

export class KMeans {
    constructor(
        private readonly centroidInitializer: (numberOfCentroids: number, numberOfDimensions: number) => number[][],
        private readonly distanceMetric: (x: number[], y: number[]) => number) {

        }

    cluster(
        data: number[][],
        numberOfCentroids: number,
        stoppingThreshold: number,
        options?: {
            maxIterations?: number,
            progressTracker?: (iteration: number) => void
        }): ClusterResult {
        if (!data.length) {
            throw new Error(`No data points provided to KMeans.cluster.`)
        }
        if (numberOfCentroids <= 0) {
            throw new Error(`Was given numberOfCentroids: ${numberOfCentroids}.  It must be a positive integer.`)
        }
        if (stoppingThreshold < 0) {
            throw new Error(`Was given stoppingThreshold: ${stoppingThreshold}.  It must be >= 0.`)
        }

        const numberOfDimensions = data[0].length
        let centroids = this.centroidInitializer(numberOfCentroids, numberOfDimensions)
        let oldCentroids: number[][] = []
        let result: ClusterResult = {
            assignments: [],
            representativeIndexes: []
        }
        let iteration = 0
        while (this.canContinue(centroids, oldCentroids, iteration, stoppingThreshold, options?.maxIterations)) {
            oldCentroids = centroids
            iteration++

            result = this.assign(data, centroids)

            centroids = this.updateCentroids(data, result.assignments, numberOfCentroids)

            if (options?.progressTracker) { options.progressTracker(iteration) }
        }

        return result
    }

    private canContinue(
        centroids: number[][],
        oldCentroids: number[][],
        iteration: number,
        stoppingThreshold: number,
        maxIterations?: number): boolean {
            if (this.hasReachedMaxIteration(iteration, maxIterations)) {
                return false
            }
            if (!oldCentroids.length) {
                return true
            }

            for (let centroidIndex = 0; centroidIndex < centroids.length; centroidIndex++) {
                const newCentroid = centroids[centroidIndex]
                const oldCentroid = oldCentroids[centroidIndex]
                for (let dimensionIndex = 0; dimensionIndex < newCentroid.length; dimensionIndex++) {
                    if (this.hasChangedEnough(
                            newCentroid[dimensionIndex],
                            oldCentroid[dimensionIndex],
                            stoppingThreshold)) {
                        return true
                    }
                }
            }
            return false
    }

    private hasChangedEnough(newValue: number, oldValue: number, threshold: number): boolean {
        return Math.abs(newValue - oldValue) > threshold
    }

    private hasReachedMaxIteration(currentIteration: number, maxIterations?: number): boolean {
        return maxIterations !== undefined && maxIterations > 0 && currentIteration >= maxIterations
    }

    private assign(data: number[][], centroids: number[][]): ClusterResult {
        const result: ClusterResult = {
            assignments: [],
            representativeIndexes: new Array(centroids.length)
        }
        for (let pointIndex = 0; pointIndex < data.length; pointIndex++) {
            const point = data[pointIndex]
            const assignment: ClusterAssignment = { clusterIndex: -1, distanceToCentroid: Number.POSITIVE_INFINITY }
            for (let clusterIndex = 0; clusterIndex < centroids.length; clusterIndex++) {
                const centroid = centroids[clusterIndex]
                const distanceToCentroid = this.distanceMetric(point, centroid)
                if (distanceToCentroid < assignment.distanceToCentroid) {
                    assignment.clusterIndex = clusterIndex
                    assignment.distanceToCentroid = distanceToCentroid
                }
            }
            result.assignments.push(assignment)
            this.updateRepresentative(result, assignment, pointIndex)
        }
        return result
    }

    private updateRepresentative(
        currentResult: ClusterResult,
        { clusterIndex, distanceToCentroid }: ClusterAssignment,
        pointIndex: number): void {
            const currentRepresentativeIndex = currentResult.representativeIndexes[clusterIndex]
            let currentSmallestDistance: number
            if (currentRepresentativeIndex === undefined) {
                currentSmallestDistance = Number.POSITIVE_INFINITY
            } else {
                currentSmallestDistance = currentResult.assignments[currentRepresentativeIndex]
                    ?.distanceToCentroid ?? Number.POSITIVE_INFINITY
            }

            if (distanceToCentroid < currentSmallestDistance) {
                currentResult.representativeIndexes[clusterIndex] = pointIndex
            }
    }

    private updateCentroids(data: number[][], assignments: ClusterAssignment[], numberOfCentroids: number): number[][] {
        const numberOfDimensions = data[0].length
        const counts: number[] = Array.from(Array(numberOfCentroids), () => 0)
        const sums: number[][] = Array.from(Array(numberOfCentroids), () => new Array(numberOfDimensions))

        for (let dataIndex = 0; dataIndex < assignments.length; dataIndex++) {
            const { clusterIndex } = assignments[dataIndex]
            counts[clusterIndex]++
            const item = data[dataIndex]
            const sum = sums[clusterIndex]
            for (let dimensionIndex = 0; dimensionIndex < item.length; dimensionIndex++) {
                sum[dimensionIndex] = (sum[dimensionIndex] || 0) + item[dimensionIndex]
            }
        }

        return sums.map((dimensionSums, centroidIndex) => {
            const count = counts[centroidIndex]
            // If no points were assigned to this centroid, initialize a new one.
            if (!count) {
                return this.centroidInitializer(1, numberOfDimensions)[0]
            }
            return dimensionSums.map(dimension => dimension / count)
        })
    }
}
