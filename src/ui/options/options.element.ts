import { BaseElement } from '../core/base-element'
import { css, html, internalProperty, property } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { SizeForm } from './size/size-form'
import { FormSubmitEvent } from './form-submit-event'
import { FitnessForm } from './fitness/fitness-form'
import { animationsStyles } from '../common/animations.styles'
import { Inject, Injectable } from 'cewdi'
import { FitnessMethod, SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { OptionsFormMapperService } from '../../services/options-form-mapper-service'
import { Router } from '../core/router'
import { PipelineRunParams, StateTopic, UpdateStateEvent } from '../../services/state'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { calculateGenomeSize } from '../../common/calculate-genome-size'
import { ModuleName } from '../core/module-name'
import { Icon } from '../common/icon'

@Injectable()
export class OptionsElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            animationsStyles,
            css`
                :host {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    align-items: stretch;
                }
                rf-container {
                    flex-grow: 0;
                    min-height: 80vh;
                    max-width: 100vw;
                }
                #optionsOutlet {
                    flex-grow: 1;
                }
                #optionsNav {
                    position: relative;
                    transition: transform var(--animation-duration) var(--easing);
                }
                :host([navishidden]) #optionsNav {
                    position: absolute;
                    top: 80px;
                    left: 0;
                    transform: translateX(-100%);
                }
                #optionsNav rf-button {
                    position: absolute;
                    top: 0;
                    right: 0;
                    transition: transform var(--animation-duration) var(--easing);
                }
                @media
                screen and (max-width: 768px) and (orientation: portrait),
                screen and (max-width: 1024px) and (orientation: landscape) {
                    #optionsNav {
                        position: absolute;
                        z-index: 1;
                        max-width: 90vw;
                    }
                    :host([navishidden]) #optionsNav rf-button {
                        transform: translateX(100%);
                    }
                }
            `
        ]
    }

    @property({ reflect: true, type: String })
    activeTab: 'size' | 'fitness' = 'size'

    @property({ reflect: false })
    showConfirm = false

    @property({ reflect: true, type: Boolean })
    navIsHidden = false

    private readonly sizeForm: SizeForm = {
        populationSize: 5000,
        timeSignatureTop: 4,
        timeSignatureBottom: 4,
        octaveMax: 5,
        octaveMin: 4,
        shortestNoteDuration: 8,
        measures: 2
    }

    private readonly fitnessForm: FitnessForm = {
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

    @internalProperty()
    private geneticAlgorithmOptions: SerializedGeneticAlgorithmOptions | undefined

    constructor(
        private readonly mapper: OptionsFormMapperService,
        private readonly router: Router,
        @Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        super()
    }

    render() {
        return html`
            <rf-container id="optionsNav">
                <rf-button size="small" @click=${() => this.navIsHidden = !this.navIsHidden}>
                    <rf-icon icon=${this.navIsHidden ? Icon.RightArrow : Icon.LeftArrow }></rf-icon>
                </rf-button>
                <rf-options-nav></rf-options-nav>
            </rf-container>
            <rf-container id="optionsOutlet">
                <rf-router-outlet moduleName="${ModuleName.Options}"></rf-router-outlet>
            </rf-container>
            <rf-popup ?show=${this.showConfirm}>
                <rf-run-confirm-form @cancel=${() => this.showConfirm = false} @form-submit=${this.onRunConfirmed}>
                </rf-run-confirm-form>
            </rf-popup>
        `
    }

    private onRunConfirmed(
        { value: { numberOfGenerations } }: FormSubmitEvent<{ numberOfGenerations: number }>) {
        this.showConfirm = false
        if (!this.geneticAlgorithmOptions) { this.updateGeneticAlgorithmOptions() }
        const options = this.geneticAlgorithmOptions
        if (options) {
            const params: PipelineRunParams = {
                size: this.sizeForm.populationSize,
                genomeSize: this.getGenomeSize(options.measures, options.timeSignature, options.shortestNoteDuration),
                options,
                numberOfGenerations
            }
            this.eventTarget.dispatchEvent(new UpdateStateEvent(StateTopic.PipelineRunParams, params))
            this.router.navigate('/run')
        } else {
            throw new Error('GeneticAlgorithm options were undefined')
        }
    }

    private getGenomeSize(
        measures: number,
        timeSignature: [number, 1 | 2 | 4 | 8 | 16],
        shortestNoteDuration: 1 | 2 | 4 | 8 | 16): number {
            return calculateGenomeSize(measures, timeSignature, shortestNoteDuration)
    }

    private updateGeneticAlgorithmOptions(): void {
        this.geneticAlgorithmOptions = this.mapper.mapFitnessForm(
            this.fitnessForm,
            this.mapper.mapSizeForm(this.sizeForm))
    }

}
