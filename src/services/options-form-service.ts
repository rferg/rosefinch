import { Inject, Injectable } from 'cewdi'
import { calculateGenomeSize } from '../common/calculate-genome-size'
import { globalEventTargetToken } from '../common/global-event-target-token'
import { SuccessResponse } from '../common/success-response'
import { FitnessMethod, RepeatedSequenceType, SerializedGeneticAlgorithmOptions } from '../genetic-algorithm'
import { OptionsForm, OptionsTemplateStore } from '../storage'
import { OptionsFormMapperService } from './options-form-mapper-service'
import { OptionsTemplateService } from './options-template.service'
import { PipelineRunParams, StateTopic, UpdateStateEvent } from './state'

interface TemplateViewInfo {
    id: string
    name: string
}
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
    private template: OptionsTemplateStore | undefined
    private _optionsForm: OptionsForm = { ...this.defaultOptions }
    private set optionsForm(val: OptionsForm) {
        if (val !== this._optionsForm) {
            this._optionsForm = val
            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.OptionsForm, { ...this._optionsForm }))
        }
    }
    private get optionsForm(): OptionsForm {
        return this._optionsForm
    }

    constructor(
        private readonly mapper: OptionsFormMapperService,
        private readonly templateService: OptionsTemplateService,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget
    ) {
        this.reset()
    }

    async setTemplate(id: string): Promise<TemplateViewInfo | undefined> {
        const template = await this.templateService.get(id)
        if (template) {
            this.optionsForm = { ...template }
            this.template = template
            this.updateGeneticAlgorithmOptions()
            return { id: template.id, name: template.name }
        } else {
            this.reset()
            return undefined
        }
    }

    async saveTemplate(): Promise<SuccessResponse<TemplateViewInfo>> {
        if (!this.template) {
            return { isSuccessful: false, errorMessage: 'No template has been selected.' }
        }
        const result = await this.templateService.put({
            ...this.template,
            ...this.optionsForm
        })
        if (result.isSuccessful) {
            this.template = result.result
        }
        return result
    }

    async createTemplate(name: string): Promise<SuccessResponse<TemplateViewInfo>> {
        const result = await this.templateService.add({ ...this.optionsForm }, name)
        if (result.isSuccessful) {
            this.template = result.result
        }
        return result
    }

    reset() {
        this.optionsForm = JSON.parse(JSON.stringify({ ...this.defaultOptions }))
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
        return this.optionsForm[property]
    }

    update(property: keyof OptionsForm, value: OptionsForm[typeof property]) {
        this.optionsForm = {
            ...this.optionsForm,
            [property]: value
        }
        this.updateGeneticAlgorithmOptions()
        if (property === 'size') {
            this.checkRepeatedSequencesMinLength()
        }
    }

    getGeneticAlgorithmOptions(): SerializedGeneticAlgorithmOptions | undefined {
        if (!this.geneticAlgorithmOptions) {
            this.updateGeneticAlgorithmOptions()
        }
        return this.geneticAlgorithmOptions
    }

    getMaxRepeatedSequenceLength(): number {
        const options = this.getGeneticAlgorithmOptions()
        const genomeSize = this.getGenomeSize(
            options?.measures ?? 0,
            options?.timeSignature ?? [ 1, 1 ],
            options?.shortestNoteDuration ?? 1)
        return Math.floor(genomeSize / 2)
    }

    private getGenomeSize(
        measures: number,
        timeSignature: [number, 1 | 2 | 4 | 8 | 16],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16): number {
            return calculateGenomeSize(measures, timeSignature, shortestNoteDuration)
    }

    private updateGeneticAlgorithmOptions() {
        this.geneticAlgorithmOptions = this.mapper.mapFitnessForm(
            this.optionsForm,
            this.mapper.mapSizeForm(this.optionsForm.size, this.geneticAlgorithmOptions))
    }

    private checkRepeatedSequencesMinLength() {
        const repeatedSequencesConfig = { ...this.optionsForm['repeatedSequences'] }
        const newTypes = repeatedSequencesConfig?.options?.types ?? []
        const maxValue = this.getMaxRepeatedSequenceLength()
        const typesAboveMax = newTypes.filter(t => t.minLength > maxValue)
        if (typesAboveMax.length) {
            typesAboveMax.forEach(t => t.minLength = maxValue)
            this.update('repeatedSequences', {
                ...repeatedSequencesConfig,
                options: {
                    ...repeatedSequencesConfig.options,
                    types: newTypes
                }
            })
        }
    }
}
