import { Pitch } from '../../src/common/pitch'
import {
    CrossoverMethod,
    FitnessMethod,
    MutationMethod,
    SelectionMethod,
    SerializedGeneticAlgorithmOptions
} from '../../src/genetic-algorithm'
import { OptionsFormMapperService } from '../../src/services/options-form-mapper-service'
import { FitnessForm } from '../../src/ui/options/fitness/fitness-form'
import { SizeForm } from '../../src/ui/options/size/size-form'

describe('OptionsFormMapperService', () => {
    const defaultOptions: SerializedGeneticAlgorithmOptions = {
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
    let service: OptionsFormMapperService

    beforeEach(() => {
        service = new OptionsFormMapperService()
    })

    describe('mapSizeForm', () => {
        it('should update default options with form values if no current options given', () => {
            const form: SizeForm = {
                populationSize: 45,
                timeSignatureTop: 2,
                timeSignatureBottom: 16,
                measures: 7,
                shortestNoteDuration: 16,
                octaveMin: 1,
                octaveMax: 4
            }

            const result = service.mapSizeForm(form)

            expect(result).toEqual({
                ...defaultOptions,
                timeSignature: [ form.timeSignatureTop, form.timeSignatureBottom ],
                measures: form.measures,
                geneFactoryOptions: {
                    ...defaultOptions.geneFactoryOptions,
                    octaveRange: [ form.octaveMin, form.octaveMax ]
                },
                shortestNoteDuration: form.shortestNoteDuration
            })
        })

        it('should update given options with form values', () => {
            const options: SerializedGeneticAlgorithmOptions = {
                ...defaultOptions,
                mutationConfig: {
                    method: MutationMethod.Point,
                    mutationRate: 0.5
                },
                geneFactoryOptions: {
                    octaveRange: [ 2, 4 ],
                    excludedPitches: [ Pitch.C ]
                }
            }
            const form: SizeForm = {
                populationSize: 45,
                timeSignatureTop: 2,
                timeSignatureBottom: 16,
                measures: 7,
                shortestNoteDuration: 16,
                octaveMin: 1,
                octaveMax: 4
            }

            const result = service.mapSizeForm(form, options)

            expect(result).toEqual({
                ...options,
                timeSignature: [ form.timeSignatureTop, form.timeSignatureBottom ],
                measures: form.measures,
                geneFactoryOptions: {
                    ...options.geneFactoryOptions,
                    octaveRange: [ form.octaveMin, form.octaveMax ]
                },
                shortestNoteDuration: form.shortestNoteDuration
            })
        })
    })

    describe('mapFitnessForm', () => {
        it('should update default options if none given', () => {
            const form: FitnessForm = {
                chords: { weight: 0, method: FitnessMethod.ChordFit, options: { chords: {} } },
                scale: {
                    weight: 0,
                    method: FitnessMethod.ScaleInterval,
                    options: { scale: { pitches: [] }, intervalScores: [] }
                },
                restProportion: { weight: 0, method: FitnessMethod.RestProportion, options: { targetProportion: 0.1 } },
                pitchSequence: {
                    weight: 0,
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
                rhythmicDispersion: { weight: 0, method: FitnessMethod.RhythmicDispersion, options: { target: 1 } }
            }

            const result = service.mapFitnessForm(form)

            // fitnessConfigs should be empty, since all weights are 0
            expect(result).toEqual(defaultOptions)
        })

        it('should update given options', () => {
            const options: SerializedGeneticAlgorithmOptions = {
                ...defaultOptions,
                mutationConfig: {
                    method: MutationMethod.Point,
                    mutationRate: 0.5
                },
                geneFactoryOptions: {
                    octaveRange: [ 2, 4 ],
                    excludedPitches: [ Pitch.C ]
                }
            }
            const form: FitnessForm = {
                chords: { weight: 0, method: FitnessMethod.ChordFit, options: { chords: {} } },
                scale: {
                    weight: 0,
                    method: FitnessMethod.ScaleInterval,
                    options: { scale: { pitches: [] }, intervalScores: [] }
                },
                restProportion: { weight: 1, method: FitnessMethod.RestProportion, options: { targetProportion: 0.1 } },
                pitchSequence: {
                    weight: 0,
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
                rhythmicDispersion: { weight: 0, method: FitnessMethod.RhythmicDispersion, options: { target: 1 } }
            }

            const result = service.mapFitnessForm(form, options)

            expect(result).toEqual({
                ...options,
                fitnessConfigs: [ { ...form.restProportion } ]
            })
        })

        it('should include all fitness configs with weight !== 0', () => {
            const form: FitnessForm = {
                chords: { weight: 2, method: FitnessMethod.ChordFit, options: { chords: {} } },
                scale: {
                    weight: -1,
                    method: FitnessMethod.ScaleInterval,
                    options: { scale: { pitches: [] }, intervalScores: [] }
                },
                restProportion: { weight: 1, method: FitnessMethod.RestProportion, options: { targetProportion: 0.1 } },
                pitchSequence: {
                    weight: 0.5,
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
                rhythmicDispersion: { weight: 4, method: FitnessMethod.RhythmicDispersion, options: { target: 1 } }
            }

            const result = service.mapFitnessForm(form)

            expect(result).toEqual({
                ...defaultOptions,
                fitnessConfigs: Object.keys(form).map(k => form[k as keyof FitnessForm])
            })
        })
    })
})
