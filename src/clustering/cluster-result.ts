import { ClusterAssignment } from './cluster-assignment'

export interface ClusterResult {
    assignments: ClusterAssignment[],
    representativeIndexes: (number | undefined)[]
}
