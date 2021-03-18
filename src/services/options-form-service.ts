import { Inject, Injectable } from 'cewdi'
import { calculateGenomeSize } from '../common/calculate-genome-size'
import { globalEventTargetToken } from '../common/global-event-target-token'
import { FitnessMethod, RepeatedSequenceType, SerializedGeneticAlgorithmOptions } from '../genetic-algorithm'
import { OptionsForm } from './options-form'
import { OptionsFormMapperService } from './options-form-mapper-service'
import { PipelineRunParams, StateTopic, UpdateStateEvent } from './state'

@Injectable()
export class OptionsFormService {
    private readonly defaultOptions: OptionsForm = {
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
    private geneticAlgorithmOptions: SerializedGeneticAlgorithmOptions | undefined
    private optionsForm: OptionsForm = this.defaultOptions

    constructor(
        private readonly mapper: OptionsFormMapperService,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget
    ) {
        this.reset()
    }

    reset() {
        this.optionsForm = { ...this.defaultOptions }
        this.updateGeneticAlgorithmOptions()
    }

    updateRunParams(numberOfGenerations: number) {
        if (!this.geneticAlgorithmOptions) { this.updateGeneticAlgorithmOptions() }
        const options = this.geneticAlgorithmOptions
        if (options) {
            const params: PipelineRunParams = {
                size: this.optionsForm.size.populationSize,
                genomeSize: this.getGenomeSize(options.measures, options.timeSignature, options.shortestNoteDuration),
                options,
                numberOfGenerations
            }
            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.PipelineRunParams, params))
        } else {
            throw new Error('GeneticAlgorithm options were undefined')
        }
    }

    get(property: keyof OptionsForm): OptionsForm[typeof property] {
        return { ...this.optionsForm }[property]
    }

    update(property: keyof OptionsForm, value: OptionsForm[typeof property]) {
        this.optionsForm = {
            ...this.optionsForm,
            [property]: value
        }
        this.updateGeneticAlgorithmOptions()
    }

    getGeneticAlgorithmOptions(): SerializedGeneticAlgorithmOptions | undefined {
        if (!this.geneticAlgorithmOptions) {
            this.updateGeneticAlgorithmOptions()
        }
        return this.geneticAlgorithmOptions
    }

    private getGenomeSize(
        measures: number,
        timeSignature: [number, 1 | 2 | 4 | 8 | 16],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16): number {
            return calculateGenomeSize(measures, timeSignature, shortestNoteDuration)
    }

    private updateGeneticAlgorithmOptions(): void {
        this.geneticAlgorithmOptions = this.mapper.mapFitnessForm(
            this.optionsForm,
            this.mapper.mapSizeForm(this.optionsForm.size, this.geneticAlgorithmOptions))
    }
}
