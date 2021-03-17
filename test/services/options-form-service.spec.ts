import { CrossoverMethod, FitnessMethod, MutationMethod, SelectionMethod, SerializedGeneticAlgorithmOptions } from '../../src/genetic-algorithm'
import { RestProportionConfig } from '../../src/genetic-algorithm/fitness/rest-proportion-config'
import { OptionsFormService } from '../../src/services'
import { OptionsForm } from '../../src/services/options-form'
import { OptionsFormMapperService } from '../../src/services/options-form-mapper-service'
import { SizeForm } from '../../src/services/size-form'
import { NewPipelineRunParams, StateTopic, UpdateStateEvent } from '../../src/services/state'

const defaultOptions: OptionsForm = {
    size: {
        populationSize: 5000,
        timeSignatureTop: 4,
        timeSignatureBottom: 4,
        octaveMax: 5,
        octaveMin: 4,
        shortestNoteDuration: 8,
        measures: 2
    },
    chords: { weight: 1, method: FitnessMethod.ChordFit, options: { chords: {} } },
    scale: {
        weight: 1,
        method: FitnessMethod.ScaleInterval,
        options: { scale: { pitches: [] }, intervalScores: [] }
    },
    restProportion: { weight: 1, method: FitnessMethod.RestProportion, options: { targetProportion: 0.1 } },
    pitchSequence: {
        weight: 1,
        method: FitnessMethod.PitchSequenceDirection,
        options: {
            sequenceLength: 3,
            scores: {
                'ascending': 2,
                'descending': 2,
                'stable': 1
            }
        }
    },
    rhythmicDispersion: { weight: 1, method: FitnessMethod.RhythmicDispersion, options: { target: 0 } }
}

const defaultGAOptions: SerializedGeneticAlgorithmOptions = {
    crossoverMethod: CrossoverMethod.HybridPoint,
    mutationConfig: {
        method: MutationMethod.Point,
        mutationRate: 0.01
    },
    selectionConfig: {
        method: SelectionMethod.Tournament,
        tournamentSize: 2
    },
    fitnessConfigs: [],
    geneFactoryOptions: {
        octaveRange: [ 3, 6 ],
        excludedPitches: []
    },
    timeSignature: [ 4, 4 ],
    measures: 4,
    shortestNoteDuration: 8
}

describe('OptionsFormService', () => {
    let mapperServiceSpy: jasmine.SpyObj<OptionsFormMapperService>
    let eventTargetSpy: jasmine.SpyObj<EventTarget>
    let service: OptionsFormService

    beforeEach(() => {
        mapperServiceSpy = jasmine.createSpyObj<OptionsFormMapperService>(
            'OptionsFormMapperService',
            [ 'mapFitnessForm', 'mapSizeForm' ])
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])

        service = new OptionsFormService(mapperServiceSpy, eventTargetSpy)
    })

    it('should create', () => {
        expect(service).toBeDefined()
    })

    describe('constructor', () => {
        it('should map geneticAlgorithmOptions from default options', () => {
            expect(mapperServiceSpy.mapFitnessForm).toHaveBeenCalledWith(defaultOptions, undefined)
            expect(mapperServiceSpy.mapSizeForm).toHaveBeenCalledWith(defaultOptions.size, undefined)
        })
    })

    describe('get', () => {
        it('should return value at property in options form', () => {
            const expected = defaultOptions.size

            const actual = service.get('size')

            expect(actual).toEqual(expected)
        })

        it('should get updated value after update', () => {
            const expected: SizeForm = { ...defaultOptions.size, measures: 9, octaveMax: 8 }
            service.update('size', expected)

            const actual = service.get('size')

            expect(actual).toEqual(expected)
        })

        it('should return undefined if property does not exist', () => {
            const actual = service.get('xyz' as keyof OptionsForm)

            expect(actual).toBeUndefined()
        })
    })

    describe('update', () => {
        it('should update value in options form', () => {
            const expected: SizeForm = { ...defaultOptions.size, measures: 9, octaveMax: 8 }

            service.update('size', expected)

            const actual = service.get('size')
            expect(actual).toEqual(expected)
        })

        it('should map genetic algorithm options with updated options', () => {
            const updatedSize: SizeForm = { ...defaultOptions.size, measures: 9, octaveMax: 8 }
            const updatedRest: RestProportionConfig = {
                ...defaultOptions.restProportion,
                options: { ...defaultOptions.restProportion.options, targetProportion: 0.9 }
            }
            service.update('size', updatedSize)
            service.update('restProportion', updatedRest)

            expect(mapperServiceSpy.mapSizeForm)
                .toHaveBeenCalledWith(updatedSize, undefined)
            const calledFitnessForm = mapperServiceSpy.mapFitnessForm.calls.mostRecent().args[0]
            expect(calledFitnessForm.restProportion).toEqual(updatedRest)
        })
    })

    describe('getGeneticAlgorithmOptions', () => {
        it('return geneticAlgorithmOptions mapped from optionsForm', () => {
            const expected = {} as SerializedGeneticAlgorithmOptions
            mapperServiceSpy.mapFitnessForm.and.returnValue(expected)

            const actual = service.getGeneticAlgorithmOptions()

            expect(actual).toEqual(expected)
        })
    })

    describe('updateRunParams', () => {
        it('should dispatch UpdateStateEvent with params from geneticAlgorithmOptions', () => {
            mapperServiceSpy.mapFitnessForm.and.returnValue(defaultGAOptions)
            const expectedNumberOfGenerations = 5

            service.updateRunParams(expectedNumberOfGenerations)

            const event = eventTargetSpy.dispatchEvent.calls.mostRecent()
                .args[0] as UpdateStateEvent<StateTopic.PipelineRunParams>
            expect(event).toBeTruthy()
            expect(event.topic).toBe(StateTopic.PipelineRunParams)
            const { size, options, numberOfGenerations } = event.newState as NewPipelineRunParams
            expect(size).toEqual(defaultOptions.size.populationSize)
            expect(options).toEqual(defaultGAOptions)
            expect(numberOfGenerations).toEqual(expectedNumberOfGenerations)
        })

        it('should throw if mapper does not define genetic algorithm options', () => {
            expect(() => service.updateRunParams(1)).toThrowError(/options were undefined/)
        })

        const cases: {
            measures: number,
            timeSignature: [number, 1 | 2 | 4 | 8 | 16 ],
            shortestNoteDuration: 1 | 2 | 4 | 8 | 16,
            expected: number
        }[] = [
            {
                measures: 4,
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 16,
                expected: 64
            },
            {
                measures: 1,
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 4,
                expected: 3
            },
            {
                measures: 1,
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 16,
                expected: 14
            },
            {
                measures: 3,
                timeSignature: [ 7, 8 ],
                shortestNoteDuration: 16,
                expected: 42
            },
            {
                measures: 3,
                timeSignature: [ 6, 8 ],
                shortestNoteDuration: 16,
                expected: 36
            },
            {
                measures: 3,
                timeSignature: [ 3, 4 ],
                shortestNoteDuration: 16,
                expected: 36
            },
            {
                measures: 3,
                timeSignature: [ 4, 2 ],
                shortestNoteDuration: 4,
                expected: 24
            },
            {
                measures: 3,
                timeSignature: [ 4, 4 ],
                shortestNoteDuration: 1,
                expected: 3
            },
            {
                measures: 2,
                timeSignature: [ 5, 4 ],
                shortestNoteDuration: 8,
                expected: 20
            }
        ]

        cases.forEach(c => {
            it('should calculate the correct genome size and pass in run params', () => {
                const mapped = { ...defaultGAOptions, ...c }
                mapperServiceSpy.mapSizeForm.and.returnValue(mapped)
                mapperServiceSpy.mapFitnessForm.and.returnValue(mapped)

                service.updateRunParams(1)

                const genomeSize = ((eventTargetSpy.dispatchEvent.calls.mostRecent()
                    .args[0] as UpdateStateEvent<StateTopic.PipelineRunParams>)
                    .newState as NewPipelineRunParams)
                    .genomeSize
                expect(genomeSize).toEqual(c.expected)
            })
        })
    })
})
