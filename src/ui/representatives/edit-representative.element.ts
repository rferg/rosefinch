import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
import { Icon } from '../common/icon'
import { ValueChangeEvent } from '../common/value-change-event'
import { BaseElement } from '../core/base-element'

@Injectable()
export class EditRepresentativeElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                }
                ::slotted(*) {
                    width: 100%;
                    flex-basis: 50%;
                    flex-grow: 0;
                    display: flex;
                    justify-content: center;
                }
                .bottom-group {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                }
                .bottom-group > * {
                    margin: var(--padding);
                }
                .rating-group {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: space-between;
                }
                .rating-group rf-range-input {
                    margin-bottom: var(--small-padding);
                    min-width: 15vw;
                }
            `
        ]
    }

    @property({ reflect: false })
    genome?: number[]

    @property({ reflect: false })
    rating?: number

    @property({ reflect: true, type: Boolean })
    playing = false

    render() {
        return html`
            <slot></slot>
            <div class="bottom-group">
                <rf-button
                    size="large"
                    buttonRole=${this.playing ? 'danger' : 'success'}
                    @click=${this.onPlayPauseClick}>
                    <rf-icon icon=${this.playing ? Icon.Pause : Icon.Play }></rf-icon>
                </rf-button>
                <div class="rating-group">
                    <rf-range-input
                        min="0"
                        max="100"
                        step="1"
                        .value=${this.rating}
                        @value-change=${this.onRatingChange}></rf-range-input>
                    <rf-rating-display .rating=${this.rating}></rf-rating-display>
                </div>
            </div>
            `
    }

    onRatingChange(event: ValueChangeEvent<number>) {
        this.rating = event.value
        this.dispatchEvent(new CustomEvent('rating-change', { detail: event.value }))
    }

    private onPlayPauseClick() {
        this.dispatchEvent(new CustomEvent(this.playing ? 'pause' : 'play'))
        this.playing = !this.playing
    }
}
