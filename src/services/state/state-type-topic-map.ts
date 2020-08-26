import { StateTopic } from './state-topic'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { ClusterConfig } from '../cluster-config'
import { UserRatingsState } from './user-ratings-state'
import { RepresentativeGenesState } from './representative-genes-state'

export type StateTypeTopicMap<T extends StateTopic> =
    T extends StateTopic.GeneticAlgorithmOptions ? SerializedGeneticAlgorithmOptions :
    T extends StateTopic.UserRatings ? UserRatingsState :
    T extends StateTopic.RepresentativeGenes ? RepresentativeGenesState :
    T extends StateTopic.ClusterConfig ? ClusterConfig :
    never
