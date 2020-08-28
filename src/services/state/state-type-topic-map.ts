import { StateTopic } from './state-topic'
import { ClusterConfig } from '../cluster-config'
import { UserRatingsState } from './user-ratings-state'
import { RepresentativeGenesState } from './representative-genes-state'
import { GeneticAlgorithmOptionsStore } from '../../storage'

export type StateTypeTopicMap<T extends StateTopic> =
    T extends StateTopic.GeneticAlgorithmOptions ? GeneticAlgorithmOptionsStore :
    T extends StateTopic.UserRatings ? UserRatingsState :
    T extends StateTopic.RepresentativeGenes ? RepresentativeGenesState :
    T extends StateTopic.ClusterConfig ? ClusterConfig :
    T extends StateTopic.RouteParams ? { params: { [key: string]: string | number } } :
    never
