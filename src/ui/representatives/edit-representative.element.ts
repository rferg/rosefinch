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
            css``
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
            <rf-range-input
                min="0"
                max="100"
                step="1"
                .value=${this.rating}
                @value-change=${this.onRatingChange}></rf-range-input>
            <rf-rating-display .rating=${this.rating}></rf-rating-display>
            <rf-button buttonRole=${this.playing ? 'danger' : 'success'} @click=${this.onPlayPauseClick}>
                <rf-icon icon=${this.playing ? Icon.Pause : Icon.Play }></rf-icon>
            </rf-button>`
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
