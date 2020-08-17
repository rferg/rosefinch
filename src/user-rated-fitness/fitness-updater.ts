import { Normalizer } from '../common/normalizer'
import { ClusterResult } from '../clustering'

export class FitnessUpdater {

    constructor(private readonly normalizer: Normalizer) {}

    update({
        fitnessValues,
        clusterResult: { assignments, representativeIndexes },
        userRepresentativeRatings,
        weight
    }: {
        fitnessValues: Int8Array,
        clusterResult: ClusterResult,
        userRepresentativeRatings: (number | undefined)[],
        weight?: number
    }): Int8Array {
        if (!this.someRepresentativesWereRated(representativeIndexes, userRepresentativeRatings)) {
            return fitnessValues
        }

        const ratingWeight = weight !== undefined ? weight : 1
        const newFitnessValues = new Int16Array(fitnessValues)
        userRepresentativeRatings.forEach((rating, ratingIndex) => {
            if (rating !== undefined) {
                const {
                    clusterIndex: currentClusterIndex,
                    distanceToCentroid: representativeDistance
                } = assignments[representativeIndexes[ratingIndex]]

                const referenceDistance = Math.max(representativeDistance, 1)
                assignments.forEach(({ clusterIndex, distanceToCentroid }, assignmentIndex) => {
                    if (clusterIndex === currentClusterIndex) {
                        const distanceWeight = referenceDistance / Math.max(distanceToCentroid, 1)
                        newFitnessValues[assignmentIndex] = Math.round(
                            distanceWeight * distanceToCentroid * ratingWeight)
                    }
                })
            }
        })

        return this.normalizer(newFitnessValues)
    }

    private someRepresentativesWereRated(
        representativeIndexes: number[],
        userRepresentativeRatings: (number | undefined)[]): boolean {
        return !!(representativeIndexes.filter((index?: number) => index !== undefined).length
            && userRepresentativeRatings.filter((rating?: number) => rating !== undefined).length)
    }
}
