import { StateService } from './state-service'
import { ClusterConfig } from './cluster-config'
import { Injectable } from 'cewdi'

@Injectable()
export class ClusterConfigProvider {
    private readonly defaultConfig: ClusterConfig = {
        maxIterations: 100,
        stopThreshold: 1,
        numberOfRepresentatives: 10
    }

    constructor(private readonly state: StateService<ClusterConfig>) { }

    getConfig(): ClusterConfig {
        return this.state.getCurrent() || { ...this.defaultConfig }
    }
}
