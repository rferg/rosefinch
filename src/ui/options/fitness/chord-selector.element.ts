import { Injectable } from 'cewdi'
import { css, html, internalProperty } from 'lit-element'
import { GeneUtil } from '../../../common/gene-util'
import { Pitch } from '../../../common/pitch'
import { Uint8 } from '../../../common/uint8'
import { ChordName, ChordService } from '../../../services'
import { BaseElement } from '../../core/base-element'
import { FormFieldChangeEvent } from '../form-field-change-event'

@Injectable()
export class ChordSelectorElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    display: flex;
                    width: 100%;
                    flex-flow: row wrap;
                    justify-content: center;
                    align-items: center;
                }
                rf-input {
                    margin: 0 var(--small-padding);
                }
            `
        ]
    }

    private readonly chordOptions: { value: ChordName, label: string }[] = [
        { value: ChordName.Major, label: 'Major' },
        { value: ChordName.Minor, label: 'Minor' },
        { value: ChordName.Diminished, label: 'Diminished' },
        { value: ChordName.DominantSeventh, label: 'Dominant 7th' },
        { value: ChordName.MajorSeventh, label: 'Major 7th' },
        { value: ChordName.MinorSeventh, label: 'Minor 7th' },
        { value: ChordName.MinorSeventhFlatFive, label: 'Minor 7th Flat 5' }
    ]

    private readonly pitchOptions: { value: Pitch, label: string }[] =
        [ ...new Array(GeneUtil.OCTAVE_LENGTH - 1) ]
            .map((_, i) => GeneUtil.getPitch(i as Uint8))
            .filter(pitch => pitch !== Pitch.Rest && pitch !== Pitch.Hold)
            .map(pitch => ({ value: pitch, label: Pitch[pitch] }))

    @internalProperty()
    private chord: ChordName = ChordName.Major

    @internalProperty()
    private root: Pitch = Pitch.C

    constructor(private readonly chordService: ChordService) {
        super()
    }

    render() {
        return html`
            <rf-input inputType="select"
                    .value=${this.root}
                    .options=${this.pitchOptions}
                    name="root"
                    @form-field-change=${this.onChange}>
            </rf-input>
            <rf-input inputType="select"
                    .value=${this.chord}
                    .options=${this.chordOptions}
                    name="chordName"
                    @form-field-change=${this.onChange}>
            </rf-input>
        `
    }

    private onChange(ev: FormFieldChangeEvent) {
        ev.stopPropagation()
        const chordName = ev.value?.chordName ?? this.chord
        const root = ev.value?.root ?? this.root
        if (chordName && root) {
            const pitches = this.chordService.getPitches(root, chordName)
            this.dispatchEvent(new FormFieldChangeEvent({
                value: { pitches },
                isValid: true
            }))
            this.chord = chordName
            this.root = root
        }
    }
}
