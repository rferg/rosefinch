import { BaseElement } from '../core/base-element'
import { css, html, internalProperty, property } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { Icon } from '../common/icon'
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
                    justify-content: center;
                    align-items: center;
                }
                rf-container {
                    flex-grow: 0;
                    width: 960px;
                    max-width: 100vw;
                }
                rf-form-tab, rf-size-form, rf-fitness-form {
                    width: 100%;
                }
                rf-form-tab {
                    opacity: 0;
                    bottom: 0;
                    position: absolute;
                    pointer-events: none;
                }
                rf-form-tab[data-active] {
                    opacity: 1;
                    transform: translateX(0);
                    position: relative;
                    pointer-events: auto;
                    animation: slideInFromRight var(--animation-duration) var(--easing);
                }
                div.headings {
                    width: 100%;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    border-bottom: 1px solid var(--light-primary-color);
                    margin-bottom: var(--padding);
                }
                div.contents {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                h3 {
                    margin-top: 0;
                }
                h4 {
                    margin-top: 0;
                    font-weight: var(--regular-weight);
                    color: var(--light-primary-color);
                    margin-bottom: -1px;
                    transition: color var(--animation-duration) var(--easing),
                        border-color var(--animation-duration) var(--easing);
                    padding: var(--small-padding);
                }
                h4[data-active] {
                    color: var(--primary-color);
                    border-bottom: 1px solid var(--primary-color);
                }
            `
        ]
    }

    @property({ reflect: true, type: String })
    activeTab: 'size' | 'fitness' = 'size'

    @property({ reflect: false })
    showConfirm = false

    private sizeForm: SizeForm = {
        populationSize: 5000,
        timeSignatureTop: 4,
        timeSignatureBottom: 4,
        octaveMax: 5,
        octaveMin: 4,
        shortestNoteDuration: 8,
        measures: 2
    }

    private fitnessForm: FitnessForm = {
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
            <rf-container>
                <h3>New Session</h3>
                <div class="headings">
                    <h4 ?data-active=${this.activeTab === 'size'}>Size</h4>
                    <h4 ?data-active=${this.activeTab === 'fitness'}>Fitness</h4>
                </div>
                <div class="contents">
                    <rf-form-tab id="sizeTab"
                        ?data-active=${this.activeTab === 'size'}
                        .submitButton=${{ role: 'primary' as 'primary', icon: Icon.RightArrow }}
                        @form-submit=${this.onSizeSubmit}>
                        <rf-size-form .value=${this.sizeForm} slot="form"></rf-size-form>
                    </rf-form-tab>
                    <rf-form-tab id="fitnessTab"
                        ?data-active=${this.activeTab === 'fitness'}
                        .submitButton=${{ role: 'success' as 'success', icon: Icon.Check }}
                        .backButton=${{ role: 'primary' as 'primary', icon: Icon.LeftArrow }}
                        @tab-back=${this.onFitnessBack}
                        @form-submit=${this.onFitnessSubmit}>
                        <rf-fitness-form
                            .value=${this.fitnessForm}
                            .geneticAlgorithmOptions=${this.geneticAlgorithmOptions}
                            slot="form"></rf-fitness-form>
                    </rf-form-tab>
                </div>
            </rf-container>
            <rf-popup ?show=${this.showConfirm}>
                <rf-run-confirm-form @cancel=${() => this.showConfirm = false} @form-submit=${this.onRunConfirmed}>
                </rf-run-confirm-form>
            </rf-popup>
        `
    }

    private onSizeSubmit(ev: FormSubmitEvent<SizeForm>) {
        this.sizeForm = { ...this.sizeForm, ...ev.value }
        this.updateGeneticAlgorithmOptions()
        this.activeTab = 'fitness'
    }

    private onFitnessBack() {
        this.activeTab = 'size'
    }

    private onFitnessSubmit(ev: FormSubmitEvent<FitnessForm>) {
        this.fitnessForm = { ...this.fitnessForm, ...ev.value }
        this.updateGeneticAlgorithmOptions()
        this.showConfirm = true
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
        console.log(this.geneticAlgorithmOptions)
    }

}
