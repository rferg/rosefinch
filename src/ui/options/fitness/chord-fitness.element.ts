import { Injectable } from 'cewdi'
import { css, html, internalProperty, property } from 'lit-element'
import { calculateGenomeSize } from '../../../common/calculate-genome-size'
import { GeneUtil } from '../../../common/gene-util'
import { Pitch } from '../../../common/pitch'
import { Uint8 } from '../../../common/uint8'
import { ChordFitConfig, ChordFitOptions, FitnessMethod, SerializedGeneticAlgorithmOptions } from '../../../genetic-algorithm'
import { OptionsFormService } from '../../../services'
import { DenominatedNote } from '../../../services/notation'
import { StateMediatorService, StateSubscription, StateTopic } from '../../../services/state'
import { animationsStyles } from '../../common/animations.styles'
import { headingsStyles } from '../../common/headings.styles'
import { Icon } from '../../common/icon'
import { BaseElement } from '../../core/base-element'
import { FormFieldChangeEvent } from '../form-field-change-event'
import { FormSubmitEvent } from '../form-submit-event'

@Injectable()
export class ChordFitnessElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
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

    private _config: ChordFitConfig = {
        method: FitnessMethod.ChordFit,
        options: { chords: {} },
        weight: 1
    }
    @property()
    get config(): ChordFitConfig {
        return this._config
    }
    set config(val: ChordFitConfig) {
        if (val !== this._config) {
            const oldVal = this._config
            this._config = val
            this.requestUpdate('config', oldVal)
                .then(() => {
                    if (this._config && this.geneticAlgorithmOptions) {
                        this.setNotes(this._config.options, this.geneticAlgorithmOptions)
                    }
                    this.submitChange()
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
                    if (this._geneticAlgorithmOptions && this.config) {
                        this.setNotes(this.config.options, this._geneticAlgorithmOptions)
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

    private readonly stateSubscription: StateSubscription

    constructor(
        private readonly formService: OptionsFormService,
        private readonly stateMediatorService: StateMediatorService) {
        super()

        this.stateSubscription = this.stateMediatorService.subscribe(StateTopic.OptionsForm, ({ chords }) => {
            this._config = { ...chords }
            if (!this._config) { throw new Error('ChordFitConfig was undefined') }
            this.geneticAlgorithmOptions = this.formService.getGeneticAlgorithmOptions()
        })
    }

    disconnectedCallback() {
        this.stateSubscription && this.stateSubscription.unsubscribe()
        super.disconnectedCallback()
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
            this.updateSelectedNotes(this.noteIndexSelected || 0, this.config.options)
        }
    }

    private onNoteClick({ originalNoteIndex }: DenominatedNote) {
        this.noteIndexSelected = originalNoteIndex
        this.updateSelectedNotes(this.noteIndexSelected, this.config.options)
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

    private submitChange() {
        this.dispatchEvent(new FormSubmitEvent({
            value: {
                chords: { ...this.config }
            }
        }))
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
        this.config = {
            ...this.config,
            options: {
                ...this.config.options,
                chords: {
                    ...this.config.options.chords,
                    [index]: chord
                }
            }
        }
    }
}
