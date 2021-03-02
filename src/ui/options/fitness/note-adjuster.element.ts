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
                    text-align: center;
                }
                span {
                    margin: calc(var(--small-padding) / 4) 0;
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
                size="small"
                title="Increase pitch"
                buttonRole="outline"
                @click=${this.incrementNote}
                ?disabled=${this.isMax(this.note)}>
                <rf-icon icon=${Icon.UpChevron}></rf-icon>
            </rf-button>
            <span>
                ${Pitch[GeneUtil.getPitch(this.note as Uint8)]}
            </span>
            <rf-button
                data-action="decrement"
                size="small"
                title="Decrease pitch"
                buttonRole="outline"
                @click=${this.decrementNote}
                ?disabled=${this.isMin(this.note)}>
                <rf-icon icon=${Icon.DownChevron}></rf-icon>
            </rf-button>
        `
    }

    private incrementNote() {
        const next = GeneUtil.getNextNote(this.note as Uint8)
        if (next !== this.note) {
            this.dispatchEvent(new FormFieldChangeEvent({
                value: { note: next },
                isValid: true
            }))
        }
    }

    private decrementNote() {
        const previous = GeneUtil.getPreviousNote(this.note as Uint8)
        if (this.note !== previous) {
            this.dispatchEvent(new FormFieldChangeEvent({
                value: { note: previous },
                isValid: true
            }))
        }
    }

    private isMax(note: number): boolean {
        return GeneUtil.isMaxNote(note as Uint8)
    }

    private isMin(note: number): boolean {
        return GeneUtil.isMinNote(note as Uint8)
    }
}
