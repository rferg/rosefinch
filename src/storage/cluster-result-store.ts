import { Store } from './store'
import { ClusterResult } from '../clustering'

export interface ClusterResultStore extends Store, ClusterResult {
    generation: number
    createdOn: Date
    updatedOn: Date
}
