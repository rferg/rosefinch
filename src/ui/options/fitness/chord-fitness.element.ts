import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { calculateGenomeSize } from '../../../common/calculate-genome-size'
import { GeneUtil } from '../../../common/gene-util'
import { Pitch } from '../../../common/pitch'
import { ChordFitOptions, SerializedGeneticAlgorithmOptions } from '../../../genetic-algorithm'
import { DenominatedNote } from '../../../services/notation'
import { BaseElement } from '../../core/base-element'
import { FormFieldChangeEvent } from '../form-field-change-event'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class ChordFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    justify-content: flex-start;
                }
                :host > * {
                    width: 100%;
                }
            `
        ]
    }

    private _options: ChordFitOptions | undefined
    @property()
    get options(): ChordFitOptions | undefined {
        return this._options
    }
    set options(val: ChordFitOptions | undefined) {
        if (val !== this._options) {
            const oldVal = this._options
            this._options = val
            this.requestUpdate('options', oldVal)
                .then(() => {
                    if (this._options && this.geneticAlgorithmOptions) {
                        this.setNotes(this._options, this.geneticAlgorithmOptions)
                    }
                })
                .catch(err => console.error(err))
        }
    }

    private _geneticAlgorithmOptions: SerializedGeneticAlgorithmOptions | undefined
    @property()
    get geneticAlgorithmOptions(): SerializedGeneticAlgorithmOptions | undefined {
        return this._geneticAlgorithmOptions
    }
    set geneticAlgorithmOptions(val: SerializedGeneticAlgorithmOptions | undefined) {
        if (val !== this._geneticAlgorithmOptions) {
            const oldVal = this._geneticAlgorithmOptions
            this._geneticAlgorithmOptions = val
            this.requestUpdate('geneticAlgorithmOptions', oldVal)
                .then(() => {
                    if (this._geneticAlgorithmOptions && this.options) {
                        this.setNotes(this.options, this._geneticAlgorithmOptions)
                    }
                })
                .catch(err => console.error(err))
        }
    }

    @internalProperty()
    private notes: number[][] = []

    @internalProperty()
    private noteIndexSelected: number | undefined

    private get noteIsSelected(): boolean {
        return this.noteIndexSelected !== undefined
    }

    render() {
        return html`
            <h5>Chords</h5>
            <rf-genome-notation
                clickable
                .options=${this.geneticAlgorithmOptions}
                .genome=${this.notes}
                .clickListener=${(note: DenominatedNote) => this.onNoteClick(note)}>
            </rf-genome-notation>
            ${this.noteIsSelected ?
                html`
                    <p>Change chord:</p>
                    <rf-chord-selector @form-field-change=${this.onChordSelected}></rf-chord-selector>
                `
                : html``}
            <rf-fitness-form-item-buttons @cancel=${this.onCancel} @submit=${this.onSubmit}>
            </rf-fitness-form-item-buttons>
        `
    }

    private setNotes(
        options: ChordFitOptions,
        { measures, timeSignature, shortestNoteDuration }: SerializedGeneticAlgorithmOptions) {
        const length = calculateGenomeSize(measures, timeSignature, shortestNoteDuration)
        const newNotes: number[][] = []
        const chords = options?.chords || {}
        for (let index = 0; index < length; index++) {
            const chord = chords[index]
            newNotes.push(chord && chord.length ? chord : [ GeneUtil.createAtOctave(Pitch.Rest, 4) ])
        }
        this.notes = newNotes
    }

    private onNoteClick({ originalNoteIndex }: DenominatedNote) {
        this.noteIndexSelected = originalNoteIndex
    }

    private onChordSelected(ev: FormFieldChangeEvent) {
        ev.stopPropagation()
        if (this.noteIsSelected) {
            const pitches = (ev.value?.pitches ?? []) as Pitch[]
            this.options = {
                ...this.options,
                chords: {
                    ...this.options?.chords,
                    [this.noteIndexSelected || 0]: pitches
                }
            }
        }
    }

    private onCancel() {
        this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    }

    private onSubmit() {
        if (this.options) {
            this.dispatchEvent(new FormSubmitEvent<ChordFitOptions>({ value: { ...this.options } }))
        }
    }
}
