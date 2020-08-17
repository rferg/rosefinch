import { ClusterResult } from '../clustering'

export interface UserRatedFitnessMessage {
    kind: 'UserRatedFitnessMessage'
    fitnessValues: Int8Array
    clusterResult: ClusterResult
    userRepresentativeRatings: (number | undefined)[]
    weight?: number
}
