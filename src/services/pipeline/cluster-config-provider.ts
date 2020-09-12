import { ClusterConfig } from './cluster-config'
import { Injectable } from 'cewdi'
import { StateMediatorService, StateTopic } from '../state'

@Injectable()
export class ClusterConfigProvider {
    private readonly defaultConfig: ClusterConfig = {
        maxIterations: 100,
        stopThreshold: 1,
        numberOfRepresentatives: 10
    }
    private config?: ClusterConfig

    constructor(private readonly state: StateMediatorService) {
        this.state.subscribe(StateTopic.ClusterConfig, config => this.config = config)
    }

    getConfig(): ClusterConfig {
        return this.config || { ...this.defaultConfig }
    }
}
