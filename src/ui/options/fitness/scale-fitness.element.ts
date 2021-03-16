import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { GeneUtil } from '../../../common/gene-util'
import { Pitch } from '../../../common/pitch'
import { Uint8 } from '../../../common/uint8'
import { FitnessMethod } from '../../../genetic-algorithm'
import { ScaleIntervalConfig } from '../../../genetic-algorithm/fitness/scale-interval-config'
import { OptionsFormService, ScaleName, ScaleService } from '../../../services'
import { headingsStyles } from '../../common/headings.styles'
import { scrollbarStyles } from '../../common/scrollbar.styles'
import { ValueChangeEvent } from '../../common/value-change-event'
import { BaseElement } from '../../core/base-element'
import { FormFieldChangeEvent } from '../form-field-change-event'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class ScaleFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            scrollbarStyles,
            headingsStyles,
            css`
                :host {
                    width: 100%;
                }
                .form-section-container {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    padding: var(--small-padding);
                    justify-content: space-between;
                    margin: 0;
                    overflow-x: hidden;
                }
                .form-section-container div {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--small-padding);
                    padding-bottom: 0;
                }
                .form-section-container label {
                    margin-right: var(--small-padding);
                }
                h5 {
                    width: 100%;
                    text-align: center;
                    margin: 0;
                }
                ul {
                    list-style: none;
                    list-style-type: none;
                    display: flex;
                    padding: var(--small-padding);
                    margin: 0;
                }
                ul.scale-list {
                    flex-flow: row wrap;
                    align-items: stretch;
                    justify-content: center;
                    padding-top: 0;
                }
                ul.scale-list li {
                    padding: var(--small-padding);
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    justify-content: center;
                }
                ul.degrees-list {
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: flex-start;
                    max-height: 28vh;
                    overflow-y: auto;
                }
                ul.degrees-list li {
                    width: 100%;
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                    align-items: center;
                    margin: var(--small-padding) 0;
                }
                .degrees-list li .container {
                    display: flex;
                    flex-flow: column nowrap;
                    text-align: left;
                }
                .description, .scale-degree {
                    font-size: var(--small-font-size);
                }
                p {
                    width: 100%;
                    text-align: center;
                    margin-top: 0
                }
            `
        ]
    }

    private _config: ScaleIntervalConfig = {
        method: FitnessMethod.ScaleInterval,
        weight: 1,
        options: { scale: { pitches: [] }, intervalScores: [] }
    }
    @property()
    get config(): ScaleIntervalConfig {
        return this._config
    }
    set config(val: ScaleIntervalConfig) {
        if (val && val !== this._config) {
            const oldVal = this._config
            this._config = val
            this.requestUpdate('config', oldVal)
                .then(() => {
                    this.setIntervalScores(
                        this.config.options.scale.pitches,
                        this.config.options.intervalScores)
                    this.submitChange()
                })
                .catch(err => console.error(err))
        }
    }

    @internalProperty()
    private get root(): Pitch {
        return this.config.options?.scale?.pitches?.[ 0 ] ?? this.defaultRoot
    }

    @internalProperty()
    private get scaleName(): ScaleName | undefined {
        return this.config.options?.scale?.name
    }

    @internalProperty()
    private intervalScores: { label: string, description: string, index: number, score: number }[] = []

    private readonly defaultRoot = Pitch.C

    private readonly scaleOptions: { value?: string, label: string }[] = [
        { value: '', label: '(None)' },
        { value: ScaleName.Chromatic, label: 'Chromatic' },
        { value: ScaleName.Major, label: 'Major' },
        { value: ScaleName.NaturalMinor, label: 'Natural Minor' },
        { value: ScaleName.Dorian, label: 'Dorian' },
        { value: ScaleName.Phrygian, label: 'Phrygian' },
        { value: ScaleName.Lydian, label: 'Lydian' },
        { value: ScaleName.Mixolydian, label: 'Mixolydian' },
        { value: ScaleName.Aeolian, label: 'Aeolian' },
        { value: ScaleName.Locrian, label: 'Locrian' },
        { value: ScaleName.MinorPentatonic, label: 'Minor Pentatonic' },
        { value: ScaleName.MajorPentatonic, label: 'Major Pentatonic' },
        { value: ScaleName.Blues, label: 'Blues' },
        { value: ScaleName.PhrygianDominant, label: 'Phrygian Dominant' }
    ]

    private readonly pitchOptions: { value: number, label: string }[] =
        [ ...new Array(GeneUtil.OCTAVE_LENGTH - 1) ]
            .map((_, i) => GeneUtil.getPitch(i as Uint8))
            .filter(pitch => pitch !== Pitch.Rest && pitch !== Pitch.Hold)
            .map(pitch => ({ value: pitch, label: Pitch[pitch] }))

    constructor(private readonly service: ScaleService, private readonly formService: OptionsFormService) {
        super()

        this.config = this.formService.get('scale') as ScaleIntervalConfig
        if (!this.config) {
            throw new Error('Scale config was undefined')
        }
    }

    render() {
        return html`
            <div class="form-section-container">
                <h5>Scale</h5>
                <div>
                    <label for="scaleName">Scale:</label>
                    <rf-input inputType="select"
                        .value=${this.config.options.scale?.name}
                        .options=${this.scaleOptions}
                        name="scaleName"
                        @form-field-change=${this.onScaleChange}>
                    </rf-input>
                </div>
                <div>
                    <label for="root">Root:</label>
                    <rf-input inputType="select"
                        .value=${this.config.options.scale?.pitches?.[0]}
                        .options=${this.pitchOptions}
                        name="root"
                        @form-field-change=${this.onRootChange}>
                    </rf-input>
                </div>
            </div>
            <ul class="scale-list">
                ${(this.config.options?.scale?.pitches ?? [])
                    .map((p, i) => {
                        const pitchName = Pitch[GeneUtil.getPitch(p as Uint8)]
                        return html`
                            <li>
                                <span class="pitch-name">${pitchName}</span>
                                <span class="scale-degree">${i + 1}</span>
                            </li>
                        `
                    })}
            </ul>
            ${this.intervalScores?.length
                ? html`
                    <h5>Degree Changes</h5>
                    <ul class="degrees-list">
                        ${this.intervalScores.map(({ label, description, index, score }) =>
                            html`
                                <li>
                                    <div class="container">
                                        <label>${label}</label>
                                        <span class="description">${description}</span>
                                    </div>
                                    <div class="container">
                                        <span class="description">Score: ${score}</span>
                                        <rf-range-input
                                            .min=${0}
                                            .max=${1}
                                            .value=${score}
                                            .step=${0.1}
                                            @value-change=${(ev: ValueChangeEvent<number>) =>
                                                this.onIntervalScoreChange(ev, index)}>
                                        </rf-range-input>
                                    </div>
                                </li>
                            `)}
                    </ul>
                `
                : html``}
            `
    }

    private onScaleChange(ev: FormFieldChangeEvent) {
        ev.stopPropagation()
        const name = ev.value.scaleName || ''
        const pitches = name ? this.service.getPitches(this.root, name) : []

        const newOptions = { ...this.config.options, scale: { ...this.config.options.scale, name, pitches } }

        if (pitches.length !== newOptions.intervalScores.length) {
            if (pitches.length > newOptions.intervalScores.length) {
                newOptions.intervalScores = newOptions.intervalScores
                    .concat(new Array(pitches.length - newOptions.intervalScores.length).fill(0))
            } else {
                newOptions.intervalScores = newOptions.intervalScores.slice(0, pitches.length)
            }
        }

        this.config = { ...this.config, options: newOptions }
    }

    private onRootChange(ev: FormFieldChangeEvent) {
        ev.stopPropagation()
        if (this.scaleName && ev.value.root) {
            const pitches = this.service.getPitches(ev.value.root as Pitch, this.scaleName)
            this.config = {
                ...this.config,
                options: {
                    ...this.config.options,
                    scale: { ...this.config.options.scale, pitches }
                }
            }
        }
    }

    private onIntervalScoreChange(ev: ValueChangeEvent<number>, index: number) {
        ev.stopPropagation()
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                intervalScores: this.config.options.intervalScores
                    .map((x, i) => i === index ? ev.value : x)
            }
        }

        this.setIntervalScores(this.config.options.scale.pitches, this.config.options.intervalScores)
    }

    private setIntervalScores(pitches: number[], optionsIntervalScores: number[]): void {
        this.intervalScores = (optionsIntervalScores ?? [])
            .map((score, index) => {
                const description = `(e.g., ${Pitch[GeneUtil.getPitch(pitches[0] as Uint8)]} ` +
                    `to ${Pitch[GeneUtil.getPitch(pitches[index] as Uint8)]})`
                const label = index ? index.toString() : '0/Octave'
                return { label, description, index, score }
            })
    }

    private submitChange() {
        this.dispatchEvent(new FormSubmitEvent({
            value: {
                scale: { ...this.config }
            }
        }))
    }
}
