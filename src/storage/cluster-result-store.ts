import { Store } from './store'
import { ClusterResult } from '../clustering'

export interface ClusterResultStore extends Store, ClusterResult {
    createdOn: Date
}
