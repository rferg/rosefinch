import {
    CrossoverMethod,
    FitnessMethod,
    MutationMethod,
    RepeatedSequencesConfig,
    RepeatedSequenceType,
    SelectionMethod,
    SerializedGeneticAlgorithmOptions
} from '../../src/genetic-algorithm'
import { RestProportionConfig } from '../../src/genetic-algorithm/fitness/rest-proportion-config'
import { OptionsFormService } from '../../src/services'
import { OptionsFormMapperService } from '../../src/services/options-form-mapper-service'
import { OptionsForm, OptionsTemplateStore, SizeForm } from '../../src/storage'
import { NewPipelineRunParams, StateTopic, UpdateStateEvent } from '../../src/services/state'
import { OptionsTemplateService } from '../../src/services/options-template.service'

let defaultOptions: OptionsForm

let defaultGAOptions: SerializedGeneticAlgorithmOptions

describe('OptionsFormService', () => {
    let mapperServiceSpy: jasmine.SpyObj<OptionsFormMapperService>
    let eventTargetSpy: jasmine.SpyObj<EventTarget>
    let templateServiceSpy: jasmine.SpyObj<OptionsTemplateService>
    let service: OptionsFormService

    beforeEach(() => {
        defaultOptions = {
            size: {
                populationSize: 1000,
                timeSignatureTop: 4,
                timeSignatureBottom: 4,
                octaveMax: 5,
                octaveMin: 4,
                shortestNoteDuration: 8,
                measures: 4
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
            rhythmicDispersion: { weight: 1, method: FitnessMethod.RhythmicDispersion, options: { target: 0 } },
            repeatedSequences: {
                weight: 1,
                method: FitnessMethod.RepeatedSequences,
                options: {
                    types: [
                        { type: RepeatedSequenceType.Pitch, minLength: 3 }
                    ]
                }
            }
        }
        defaultGAOptions = {
            crossoverMethod: CrossoverMethod.HybridPoint,
            mutationConfig: {
                method: MutationMethod.Point,
                mutationRate: 0.05
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
        mapperServiceSpy = jasmine.createSpyObj<OptionsFormMapperService>(
            'OptionsFormMapperService',
            [ 'mapFitnessForm', 'mapSizeForm' ])
        eventTargetSpy = jasmine.createSpyObj<EventTarget>('EventTarget', [ 'dispatchEvent' ])
        templateServiceSpy = jasmine.createSpyObj<OptionsTemplateService>(
            'OptionsTemplateService',
            [ 'get', 'put', 'add' ]
        )
        templateServiceSpy.get.and.returnValue(Promise.resolve(undefined))

        service = new OptionsFormService(mapperServiceSpy, templateServiceSpy, eventTargetSpy)
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

    describe('setTemplate', () => {
        it('should retrieve template with given id', async () => {
            const id = 'id'

            await service.setTemplate(id)

            expect(templateServiceSpy.get).toHaveBeenCalledWith(id)
        })

        it('should update options form with template', async () => {
            const id = 'id'
            const expectedMeasures = defaultOptions.size.measures + 1
            const template: OptionsTemplateStore = {
                ...defaultOptions,
                size: { ...defaultOptions.size, measures: expectedMeasures },
                storeName: 'optionsTemplate',
                createdOn: new Date(),
                lastAccessedOn: new Date(),
                updatedOn: new Date(),
                id,
                name: 'test'
            }
            templateServiceSpy.get.and.returnValue(Promise.resolve(template))

            const result = await service.setTemplate(id)

            expect(result).toEqual({
                id: template.id,
                name: template.name
            })
            const updatedMeasures = (service.get('size') as SizeForm).measures
            expect(updatedMeasures).toEqual(expectedMeasures)
            expect(mapperServiceSpy.mapFitnessForm).toHaveBeenCalledWith(template, undefined)
            expect(mapperServiceSpy.mapSizeForm).toHaveBeenCalledWith(template.size, undefined)
        })

        it('should set to default options and return undefined if template does not exist', async () => {
            const result = await service.setTemplate('')

            expect(result).toBeUndefined()
            expect(mapperServiceSpy.mapFitnessForm).toHaveBeenCalledWith(defaultOptions, undefined)
            expect(mapperServiceSpy.mapSizeForm).toHaveBeenCalledWith(defaultOptions.size, undefined)
        })
    })

    describe('saveTemplate', () => {
        it('should return failed if no template has been set', async () => {
            const result = await service.saveTemplate()

            expect(result.isSuccessful).toBeFalse()
            expect(result.errorMessage).toContain('template')
        })

        it('should save template with updated options form values', async () => {
            const id = 'id'
            const originalTemplate: OptionsTemplateStore = {
                ...defaultOptions,
                storeName: 'optionsTemplate',
                createdOn: new Date(),
                lastAccessedOn: new Date(),
                updatedOn: new Date(),
                id,
                name: 'test'
            }
            const expectedMeasures = defaultOptions.size.measures + 1
            const expectedSize = { ...originalTemplate.size, measures: expectedMeasures }
            const expectedTemplate: OptionsTemplateStore = {
                ...originalTemplate,
                size: expectedSize
            }
            templateServiceSpy.put.and.returnValue(Promise.resolve({
                isSuccessful: true,
                result: expectedTemplate
            }))
            templateServiceSpy.get.and.returnValue(Promise.resolve(originalTemplate))
            await service.setTemplate(id)
            service.update('size', expectedSize)

            const result = await service.saveTemplate()

            expect(result.isSuccessful).toBeTrue()
            expect(result.result).toEqual(expectedTemplate)
            expect(service.get('size')).toEqual(expectedSize)
        })
    })

    describe('createTemplate', () => {
        it('should add template with options form values and given name', async () => {
            const name = 'name'
            const expectedRestProportion = {
                ...defaultOptions.restProportion,
                options: { ...defaultOptions.restProportion.options, targetProportion: 0.75 }
            }
            const expectedOptions = { ...defaultOptions, restProportion: expectedRestProportion }
            service.update('restProportion', expectedRestProportion)
            templateServiceSpy.add.and.returnValue(Promise.resolve({ isSuccessful: true }))

            const result = await service.createTemplate(name)

            expect(result.isSuccessful).toBeTrue()
            expect(templateServiceSpy.add).toHaveBeenCalledWith(expectedOptions, name)
        })

        it('should return failed if add fails', async () => {
            templateServiceSpy.add.and.returnValue(Promise.resolve({ isSuccessful: false }))

            const result = await service.createTemplate('a')

            expect(result.isSuccessful).toBeFalse()
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

        it('should update repeatedSequences values to max value if size is updated and they are over max', () => {
            mapperServiceSpy.mapFitnessForm.and.returnValue(defaultGAOptions)
            const initialMax = service.getMaxRepeatedSequenceLength()
            const updatedRepeatedConfig: RepeatedSequencesConfig = {
                method: FitnessMethod.RepeatedSequences,
                options: {
                    types: [
                        {
                            type: RepeatedSequenceType.Pitch,
                            minLength: initialMax
                        }
                    ]
                }
            }
            service.update('repeatedSequences', updatedRepeatedConfig)

            const newMeasures = defaultGAOptions.measures - 1
            mapperServiceSpy.mapFitnessForm.and.returnValue({
                ...defaultGAOptions,
                measures: newMeasures
            })
            service.update('size', {
                ...defaultOptions.size,
                measures: newMeasures
            })

            const afterUpdateMax = service.getMaxRepeatedSequenceLength()
            expect(afterUpdateMax).toBeLessThan(initialMax)
            const newRepeatedConfig = service.get('repeatedSequences') as RepeatedSequencesConfig
            expect(newRepeatedConfig.options.types.every(t => t.minLength === afterUpdateMax)).toBeTrue()
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

        cases.forEach(c => {
            it(`should calculate the correct genome size and pass in run params with ${JSON.stringify(c)}`, () => {
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

    describe('getMaxRepeatedSequenceLength', () => {
        cases.forEach(c => {
            it(`should return half of genome size rounded down with ${JSON.stringify(c)}`, () => {
                const mapped = { ...defaultGAOptions, ...c }
                mapperServiceSpy.mapSizeForm.and.returnValue(mapped)
                mapperServiceSpy.mapFitnessForm.and.returnValue(mapped)
                const expected = Math.floor(c.expected / 2)

                const actual = service.getMaxRepeatedSequenceLength()

                expect(actual).toEqual(expected)
            })
        })
    })
})
