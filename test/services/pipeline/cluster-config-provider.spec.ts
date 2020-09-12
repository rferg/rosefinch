import { ClusterConfigProvider } from '../../../src/services/pipeline/cluster-config-provider'
import { ClusterConfig } from '../../../src/services/pipeline/cluster-config'
import { StateMediatorService } from '../../../src/services/state'

describe('ClusterConfigProvider', () => {
    let stateSpy: jasmine.SpyObj<StateMediatorService>

    beforeEach(() => {
        stateSpy = jasmine.createSpyObj('StateMediatorService', [ 'subscribe' ])
    })

    it('should return default config if state returns nothing', () => {
        const defaultConfig: ClusterConfig = {
            maxIterations: 100,
            stopThreshold: 1,
            numberOfRepresentatives: 10
        }
        const provider = new ClusterConfigProvider(stateSpy)

        const config = provider.getConfig()

        expect(config).toEqual(defaultConfig)
    })

    it('should return config from state', () => {
        const expected: ClusterConfig = {
            maxIterations: 2,
            stopThreshold: 2,
            numberOfRepresentatives: 2
        }
        const provider = new ClusterConfigProvider(stateSpy)
        const listener = stateSpy.subscribe.calls.mostRecent().args[1]
        listener(expected)

        const config = provider.getConfig()

        expect(config).toEqual(expected)
    })
})
