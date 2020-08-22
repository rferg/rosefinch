import { ClusterConfigProvider } from '../../src/services/cluster-config-provider'
import { StateService } from '../../src/services/state-service'
import { ClusterConfig } from '../../src/services/cluster-config'

describe('ClusterConfigProvider', () => {
    let provider: ClusterConfigProvider
    let stateSpy: jasmine.SpyObj<StateService<ClusterConfig>>

    beforeEach(() => {
        stateSpy = jasmine.createSpyObj<StateService<ClusterConfig>>('StateService', [ 'getCurrent' ])
        provider = new ClusterConfigProvider(stateSpy)
    })

    it('should return default config if state returns nothing', () => {
        const defaultConfig: ClusterConfig = {
            maxIterations: 100,
            stopThreshold: 1,
            numberOfRepresentatives: 10
        }

        const config = provider.getConfig()

        expect(config).toEqual(defaultConfig)
    })

    it('should return config from state', () => {
        const expected: ClusterConfig = {
            maxIterations: 2,
            stopThreshold: 2,
            numberOfRepresentatives: 2
        }
        stateSpy.getCurrent.and.returnValue(expected)

        const config = provider.getConfig()

        expect(config).toEqual(expected)
    })
})
