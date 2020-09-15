import { GeneticAlgorithmService } from '../../../src/services/pipeline/genetic-algorithm-service'
import { UuidService } from '../../../src/services/pipeline/uuid-service'
import { PipelineResult, PipelineService, PipelineState } from '../../../src/services/pipeline'
import {
    GeneticAlgorithmOptionsRepository,
    GeneticAlgorithmOptionsStore,
    GeneticAlgorithmRepository
} from '../../../src/storage'
import { StateMediatorService, StateTopic, UpdateStateEvent } from '../../../src/services/state'
import { cancelPipelineEventType } from '../../../src/services/pipeline/cancel-pipeline-event-type'
import { CancelPipelineEvent } from '../../../src/services/pipeline/cancel-pipeline-event'
import { CrossoverMethod, SerializedGeneticAlgorithmOptions } from '../../../src/genetic-algorithm'
import { PipelineProgressEvent } from '../../../src/services/pipeline/pipeline-progress-event'
import { PipelineStageName } from '../../../src/services/pipeline/pipeline-stage-name'

describe('GeneticAlgorithmService', () => {
    let service: GeneticAlgorithmService
    let uuidSpy: jasmine.SpyObj<UuidService>
    let pipelineService: jasmine.SpyObj<PipelineService>
    let gaRepoSpy: jasmine.SpyObj<GeneticAlgorithmRepository>
    let optionsRepoSpy: jasmine.SpyObj<GeneticAlgorithmOptionsRepository>
    let stateSpy: jasmine.SpyObj<StateMediatorService>
    let eventSpy: jasmine.SpyObj<EventTarget>

    beforeEach(() => {
        uuidSpy = jasmine.createSpyObj<UuidService>('UuidService', [ 'getUuid' ])
        pipelineService = jasmine.createSpyObj<PipelineService>('PipelineService', [ 'run', 'cancelCurrent' ])
        pipelineService.run.and.returnValue(Promise.resolve({} as PipelineResult<PipelineState>))
        gaRepoSpy = jasmine.createSpyObj<GeneticAlgorithmRepository>('GeneticAlgorithmRepository', [ 'add', 'delete' ])
        gaRepoSpy.add.and.returnValue(Promise.resolve(''))
        optionsRepoSpy = jasmine.createSpyObj<GeneticAlgorithmOptionsRepository>(
            'GeneticAlgorithmOptionsRepository',
            [ 'add', 'get', 'put', 'delete' ])
        optionsRepoSpy.add.and.returnValue(Promise.resolve(''))
        optionsRepoSpy.get.and.returnValue(Promise.resolve(undefined))
        optionsRepoSpy.put.and.returnValue(Promise.resolve(''))
        stateSpy = jasmine.createSpyObj<StateMediatorService>('StateMediatorService', [ 'subscribe' ])
        eventSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent', 'addEventListener' ])
        service = new GeneticAlgorithmService(
            uuidSpy,
            pipelineService,
            gaRepoSpy,
            optionsRepoSpy,
            stateSpy,
            eventSpy
        )
    })

    describe('constructor', () => {
        it('should subscribe to GeneticAlgorithmOptions StateTopic', () => {
            expect(stateSpy.subscribe).toHaveBeenCalledWith(StateTopic.GeneticAlgorithmOptions, jasmine.any(Function))
        })

        it('should subscribe to CancelPipeline events', () => {
            expect(eventSpy.addEventListener).toHaveBeenCalledWith(cancelPipelineEventType, jasmine.any(Function))
        })

        describe('cancel pipeline event listener', () => {
            let listener: EventListener

            beforeEach(() => {
                listener = eventSpy.addEventListener.calls.mostRecent().args[1] as EventListener
            })

            it('should call cancelCurrent on PipelineService', () => {
                listener(new CancelPipelineEvent())

                expect(pipelineService.cancelCurrent).toHaveBeenCalled()
            })
        })

        describe('state GeneticAlgorithmOptions listener', () => {
            let listener: (state: GeneticAlgorithmOptionsStore) => Promise<any>
            const options = {
                id: '1'
            } as GeneticAlgorithmOptionsStore

            beforeEach(() => {
                listener = stateSpy.subscribe.calls.mostRecent().args[1]
            })

            it('should add options if record does not exist', async () => {
                await listener(options)

                expect(optionsRepoSpy.get).toHaveBeenCalledWith(options.id)
                expect(optionsRepoSpy.add).toHaveBeenCalledWith(options)
            })

            it('should put if record exists', async () => {
                optionsRepoSpy.get.and.returnValue(Promise.resolve(options))
                const updated: GeneticAlgorithmOptionsStore = {
                    ...options,
                    crossoverMethod: CrossoverMethod.HybridPoint
                }
                await listener(updated)

                expect(optionsRepoSpy.get).toHaveBeenCalledWith(options.id)
                expect(optionsRepoSpy.put).toHaveBeenCalledWith(updated)
            })

            it('should do nothing if passed options do not have id', async () => {
                await listener({} as GeneticAlgorithmOptionsStore)

                expect(optionsRepoSpy.get).not.toHaveBeenCalled()
            })
        })
    })

    describe('run', () => {
        it('should return error if PipelineService throws', async () => {
            const error = new Error('Test error')
            const geneticAlgorithmId = '1'
            const options = {
                geneticAlgorithmId,
                numberOfGenerations: 1
            }
            pipelineService.run.and.throwError(error)

            const result = await service.run(options)

            expect(pipelineService.run).toHaveBeenCalledWith(options, jasmine.any(Function))
            expect(result).toEqual({
                error,
                geneticAlgorithmId,
                isCanceled: false
            })
        })

        it(
            'should dispatch update events for RepresentativeGenes and UserRatings if returned from pipeline',
            async () => {
                const result = {
                    geneticAlgorithmId: '1',
                    numberOfGenerations: 1,
                    geneticAlgorithm: { generation: 1 },
                    representativeGenes: [ [ 1 ] ]
                } as PipelineState
                pipelineService.run.and.returnValue(Promise.resolve({
                    result,
                    isCanceled: false,
                    error: undefined
                }))

                const serviceResult = await service.run({ geneticAlgorithmId: '1', numberOfGenerations: 1 })

                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(
                    new UpdateStateEvent(
                        StateTopic.RepresentativeGenes,
                        { representativeGenes: result.representativeGenes || [] })
                )
                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(
                    new UpdateStateEvent(
                        StateTopic.UserRatings,
                        {
                            userRepresentativeRatings: new Array<number | undefined>(
                                result.representativeGenes?.length)
                        }))
                expect(serviceResult).toEqual({
                    error: undefined,
                    isCanceled: false,
                    geneticAlgorithmId: result.geneticAlgorithmId,
                    generation: result.geneticAlgorithm?.generation
                })
        })

        it('should not dispatch update events if canceled', async () => {
            pipelineService.run.and.returnValue(Promise.resolve({
                isCanceled: true,
                result: {} as PipelineState,
                error: undefined
            }))

            const result = await service.run({ geneticAlgorithmId: '1', numberOfGenerations: 1 })

            expect(result.isCanceled).toBeTrue()
            expect(eventSpy.dispatchEvent).not.toHaveBeenCalled()
        })

        describe('progress callback', () => {
            it('should dispatch ProgressEvents', async () => {
                pipelineService.run.and.returnValue(Promise.resolve({
                    result: {} as PipelineState,
                    error: undefined,
                    isCanceled: true
                }))
                await service.run({ geneticAlgorithmId: '1', numberOfGenerations: 1 })
                const callback = pipelineService.run.calls.mostRecent().args[1]

                const event = new PipelineProgressEvent({
                    stageName: PipelineStageName.UpdateGeneticAlgorithm,
                    detail: { message: 'test' }
                })
                callback(event.report)

                expect(eventSpy.dispatchEvent).toHaveBeenCalledWith(event)
            })
        })
    })

    describe('createAndRun', () => {
        const id = 'testId'

        beforeEach(() => {
            uuidSpy.getUuid.and.returnValue(id)
        })

        it('should add genetic algorithm record with generated id', async () => {
            const input = {
                size: 1,
                genomeSize: 1,
                numberOfGenerations: 1,
                options: {} as SerializedGeneticAlgorithmOptions
            }

            await service.createAndRun(input)

            expect(gaRepoSpy.add).toHaveBeenCalledWith({
                storeName: 'geneticAlgorithm',
                id,
                population: { size: input.size, genomeSize: input.genomeSize },
                generation: 0
            })
        })

        it('should add options in repo', async () => {
            const input = {
                size: 1,
                genomeSize: 1,
                numberOfGenerations: 1,
                options: { crossoverMethod: CrossoverMethod.HybridPoint } as SerializedGeneticAlgorithmOptions
            }

            await service.createAndRun(input)

            expect(optionsRepoSpy.add).toHaveBeenCalledWith({
                id,
                storeName: 'geneticAlgorithmOptions',
                ...input.options
            })
        })

        it('should call run with id and numberOfGenerations', async () => {
            const runSpy = spyOn(service, 'run')
            const input = {
                size: 1,
                genomeSize: 1,
                numberOfGenerations: 1,
                options: {} as SerializedGeneticAlgorithmOptions
            }

            await service.createAndRun(input)

            expect(runSpy).toHaveBeenCalledWith({
                geneticAlgorithmId: id,
                numberOfGenerations: input.numberOfGenerations
            })
        })

        it('should delete ga and options if run is canceled', async () => {
            pipelineService.run.and.returnValue(Promise.resolve({
                isCanceled: true,
                result: {} as PipelineState,
                error: undefined
            }))
            const input = {
                size: 1,
                genomeSize: 1,
                numberOfGenerations: 1,
                options: {} as SerializedGeneticAlgorithmOptions
            }

            await service.createAndRun(input)

            expect(gaRepoSpy.delete).toHaveBeenCalledWith(id)
            expect(optionsRepoSpy.delete).toHaveBeenCalledWith(id)
        })

        it('should delete ga and options if run returned error', async () => {
            pipelineService.run.and.returnValue(Promise.resolve({
                isCanceled: false,
                result: {} as PipelineState,
                error: {
                    stageName: PipelineStageName.GetClusterResult,
                    error: new Error()
                }
            }))
            const input = {
                size: 1,
                genomeSize: 1,
                numberOfGenerations: 1,
                options: {} as SerializedGeneticAlgorithmOptions
            }

            await service.createAndRun(input)

            expect(gaRepoSpy.delete).toHaveBeenCalledWith(id)
            expect(optionsRepoSpy.delete).toHaveBeenCalledWith(id)
        })
    })
})
