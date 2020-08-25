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
                const representativeIndex = representativeIndexes[ratingIndex]
                if (representativeIndex !== undefined) {
                    const {
                        clusterIndex: currentClusterIndex,
                        distanceToCentroid: representativeDistance
                    } = assignments[representativeIndex]

                    const referenceDistance = Math.max(representativeDistance, 1)
                    assignments.forEach(({ clusterIndex, distanceToCentroid }, assignmentIndex) => {
                        if (clusterIndex === currentClusterIndex) {
                            distanceToCentroid = Math.max(distanceToCentroid, 1)
                            const distanceWeight = referenceDistance / distanceToCentroid
                            newFitnessValues[assignmentIndex] = fitnessValues[assignmentIndex] + Math.round(
                                distanceWeight * ratingWeight * rating)
                        }
                    })
                }
            }
        })

        return this.normalizer(newFitnessValues)
    }

    private someRepresentativesWereRated(
        representativeIndexes: (number | undefined)[],
        userRepresentativeRatings: (number | undefined)[]): boolean {
        return !!(representativeIndexes.filter((index?: number) => index !== undefined).length
            && userRepresentativeRatings.filter((rating?: number) => rating !== undefined).length)
    }
}
