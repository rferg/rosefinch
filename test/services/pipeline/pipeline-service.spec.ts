import { PipelineService } from '../../../src/services/pipeline/pipeline-service'
import { PipelineFactory } from '../../../src/services/pipeline/pipeline-factory'
import { UuidService } from '../../../src/services/pipeline/uuid-service'
import { PipelineState } from '../../../src/services/pipeline/pipeline-state'
import { SharedStatePipeline } from '../../../src/services/pipeline/shared-state-pipeline'
import { PipelineResult } from '../../../src/services/pipeline/pipeline-result'

describe('PipelineService', () => {
    let service: PipelineService
    let factorySpy: jasmine.SpyObj<PipelineFactory>
    let pipelineSpy: jasmine.SpyObj<SharedStatePipeline<PipelineState>>
    let uuidSpy: jasmine.SpyObj<UuidService>
    let progressSpy: jasmine.Spy

    const state: PipelineState = {
        geneticAlgorithmId: '1',
        numberOfGenerations: 1,
        userRepresentativeRatings: []
    }
    const defaultResult: PipelineResult<PipelineState> = { isCanceled: false, result: state, error: undefined }

    beforeEach(() => {
        pipelineSpy = jasmine.createSpyObj<SharedStatePipeline<PipelineState>>(
            'SharedStatePipeline',
            [ 'run', 'cancel' ])
        factorySpy = jasmine.createSpyObj<PipelineFactory>('PipelineFactory', [ 'getPipeline' ])
        factorySpy.getPipeline.and.returnValue(pipelineSpy)
        pipelineSpy.run.and.returnValue(Promise.resolve(defaultResult))
        uuidSpy = jasmine.createSpyObj<UuidService>('UuidService', [ 'getUuid' ])
        service = new PipelineService(factorySpy, uuidSpy)
        progressSpy = jasmine.createSpy('progressCallback')
    })

    describe('run', () => {
        it('should get factory from pipeline and run it', async () => {
            const result = await service.run(state, progressSpy)

            expect(result).toEqual(defaultResult)
            expect(factorySpy.getPipeline).toHaveBeenCalledWith({
                userRepresentativeRatings: state.userRepresentativeRatings
            })
            expect(pipelineSpy.run).toHaveBeenCalledWith(state, progressSpy)
        })

        it('should add geneticAlgorithmId to state if none provided', async () => {
            const expectedId = 'testId'
            uuidSpy.getUuid.and.returnValue(expectedId)

            await service.run({
                ...state,
                geneticAlgorithmId: '',
                geneticAlgorithm: {
                    id: ''
                }
            } as PipelineState, progressSpy)

            expect(pipelineSpy.run).toHaveBeenCalledWith({
                ...state,
                geneticAlgorithmId: expectedId,
                geneticAlgorithm: { id: expectedId }
            } as PipelineState, progressSpy)
        })

        it('should cancel any currently running pipeline', async () => {
            pipelineSpy.run.and.returnValues(
                new Promise((resolve) => {
                    setTimeout(() => {}, 0)
                    resolve({} as PipelineResult<PipelineState>)
                }),
                Promise.resolve(defaultResult)
            )

            service.run(state, progressSpy)
                .then(() => {})
                .catch(err => { throw err })
            const result = await service.run(state, progressSpy)

            expect(pipelineSpy.cancel).toHaveBeenCalledTimes(1)
            expect(result).toEqual(defaultResult)
        })
    })

    describe('cancelCurrent', () => {
        it('should resolve', async () => {
            await expectAsync(service.cancelCurrent()).toBeResolved()
        })

        it('should cancel current pipeline run', async () => {
            pipelineSpy.run.and.returnValues(
                new Promise((resolve) => {
                    setTimeout(() => {}, 0)
                    resolve({} as PipelineResult<PipelineState>)
                })
            )

            service.run(state, progressSpy)
                .then(() => {})
                .catch(err => { throw err })
            await service.cancelCurrent()

            expect(pipelineSpy.cancel).toHaveBeenCalled()
        })
    })
})
