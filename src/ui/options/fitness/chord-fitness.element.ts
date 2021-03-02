import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { calculateGenomeSize } from '../../../common/calculate-genome-size'
import { GeneUtil } from '../../../common/gene-util'
import { Pitch } from '../../../common/pitch'
import { Uint8 } from '../../../common/uint8'
import { ChordFitOptions, SerializedGeneticAlgorithmOptions } from '../../../genetic-algorithm'
import { DenominatedNote } from '../../../services/notation'
import { animationsStyles } from '../../common/animations.styles'
import { Icon } from '../../common/icon'
import { BaseElement } from '../../core/base-element'
import { FormFieldChangeEvent } from '../form-field-change-event'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class ChordFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
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
                h5 {
                    text-align: center;
                }
                div {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: center;
                    align-items: center;
                }
                div rf-button[buttonRole="success"] {
                    margin: var(--small-padding);
                }
                rf-inside-container.note {
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    align-items: center;
                    width: auto;
                    padding: var(--small-padding);
                    animation: fadeIn var(--animation-duration) var(--easing);
                }
                rf-inside-container.note rf-button[buttonRole="danger"] {
                    margin-left: var(--small-padding);
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

    @internalProperty()
    private selectedNotes: number[] = []

    private lastChordSelectedForChange: number[] | undefined

    render() {
        return html`
            <h5>Chords</h5>
            <rf-genome-notation
                clickable
                .options=${this.geneticAlgorithmOptions}
                .genome=${this.notes}
                .clickListener=${(note: DenominatedNote) => this.onNoteClick(note)}>
            </rf-genome-notation>
            ${this.noteIndexSelected !== undefined ?
                html`
                    <div class="notes-container">
                        <p>Notes:</p>
                        ${this.selectedNotes.map((note, i) =>
                            html`
                                <rf-inside-container class="note">
                                    <rf-note-adjuster
                                        .note=${note}
                                        @form-field-change=${(ev: FormFieldChangeEvent) => this.onNoteChange(ev, i)}>
                                    </rf-note-adjuster>
                                    <rf-button
                                        size="small"
                                        buttonRole="danger"
                                        title="Remove note"
                                        @click=${() => this.removeNote(i)}>
                                        <rf-icon icon=${Icon.Cross}></rf-icon>
                                    </rf-button>
                                </rf-inside-container>
                            `)}
                        <rf-button
                            buttonRole="success"
                            title="Add note"
                            @click=${() => this.addNote()}>
                            <rf-icon icon=${Icon.Plus}></rf-icon>
                        </rf-button>
                    </div>
                    <rf-inside-container class="chord-selector-container">
                        <p>Insert Chord:</p>
                        <rf-chord-selector @form-field-change=${this.onChordChange}></rf-chord-selector>
                        <rf-button
                            buttonRole="success"
                            title="Insert chord"
                            @click=${this.onChordSelected}>
                            <rf-icon icon=${Icon.Check} height="var(--font-size-small)"></rf-icon>
                        </rf-button>
                    </rf-inside-container>
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

        if (this.noteIndexSelected !== undefined) {
            this.updateSelectedNotes(this.noteIndexSelected || 0, this.options)
        }
    }

    private onNoteClick({ originalNoteIndex }: DenominatedNote) {
        this.noteIndexSelected = originalNoteIndex
        this.updateSelectedNotes(this.noteIndexSelected, this.options)
    }

    private updateSelectedNotes(selectedIndex: number, options?: ChordFitOptions) {
        let notes: number[] = []
        const chord = (options && options.chords && options.chords[selectedIndex])
        if (chord && chord.length && chord[0] && GeneUtil.getPitch(chord[0]) !== Pitch.Rest) {
            notes = [ ...chord ]
        }
        this.selectedNotes = notes
    }

    private onChordChange(ev: FormFieldChangeEvent) {
        ev.stopPropagation()
        this.lastChordSelectedForChange = ev.value?.pitches
    }

    private onChordSelected() {
        if (this.noteIndexSelected !== undefined && this.lastChordSelectedForChange) {
            const chord = this.lastChordSelectedForChange
            this.updateChord(chord, this.noteIndexSelected)
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

    private onNoteChange(ev: FormFieldChangeEvent, noteIndex: number) {
        ev.stopPropagation()
        const note = ev.value.note
        if (!note) { return }
        if (this.noteIndexSelected === undefined) { return }
        const chord = [ ...this.selectedNotes ]
        chord.splice(noteIndex, 1, note)
        this.updateChord(chord, this.noteIndexSelected)
    }

    private removeNote(noteIndex: number) {
        if (this.noteIndexSelected === undefined) { return }
        const chord = [ ...this.selectedNotes ]
        chord.splice(noteIndex, 1)
        this.updateChord(chord, this.noteIndexSelected)
    }

    private addNote() {
        if (this.noteIndexSelected === undefined) { return }
        const chord = [ ...this.selectedNotes ]
        const lastNote = chord[chord.length - 1] || GeneUtil.createAtOctave(Pitch.Rest, 4)
        chord.push(GeneUtil.getNextNote(lastNote as Uint8))
        this.updateChord(chord, this.noteIndexSelected)
    }

    private updateChord(chord: number[], index: number) {
        chord.sort((a, b) => a - b)
        this.options = {
            ...this.options,
            chords: {
                ...this.options?.chords,
                [index]: chord
            }
        }
    }
}
