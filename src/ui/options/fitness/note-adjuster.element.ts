import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { GeneUtil } from '../../../common/gene-util'
import { Pitch } from '../../../common/pitch'
import { Uint8 } from '../../../common/uint8'
import { Icon } from '../../common/icon'
import { BaseElement } from '../../core/base-element'
import { FormFieldChangeEvent } from '../form-field-change-event'

@Injectable()
export class NoteAdjusterElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: stretch;
                    justify-content: center;
                }
            `
        ]
    }

    @property()
    note = 1

    render() {
        return html`
            <rf-button
                data-action="increment"
                title="Increase pitch"
                @click=${this.incrementNote}
                ?disabled=${this.isMax(this.note)}>
                <rf-icon icon=${Icon.UpChevron}></rf-icon>
            </rf-button>
            <span>
                ${Pitch[GeneUtil.getPitch(this.note as Uint8)]}
            </span>
            <rf-button
                data-action="decrement"
                title="Decrease pitch"
                @click=${this.decrementNote}
                ?disabled=${this.isMin(this.note)}>
                <rf-icon icon=${Icon.DownChevron}></rf-icon>
            </rf-button>
        `
    }

    private incrementNote() {
        let next = this.note + 1
        while (!this.isNote(next) && !this.isMax(next)) {
            next++
        }
        if (next !== this.note) {
            this.dispatchEvent(new FormFieldChangeEvent({
                value: { note: next },
                isValid: true
            }))
        }
    }

    private decrementNote() {
        let next = this.note - 1
        while (!this.isNote(next) && !this.isMin(next)) {
            next--
        }
        if (this.note !== next) {
            this.dispatchEvent(new FormFieldChangeEvent({
                value: { note: next },
                isValid: true
            }))
        }
    }

    private isNote(note: number): boolean {
        const pitch = GeneUtil.getPitch(note as Uint8)
        return !(pitch === Pitch.Hold || pitch === Pitch.Rest)
    }

    private isMax(note: number): boolean {
        return note >= GeneUtil.MAX_NOTE_VALUE - 1
    }

    private isMin(note: number): boolean {
        return note <= 1
    }
}
