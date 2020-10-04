import { Injectable } from 'cewdi'
import { css, html, property } from 'lit-element'
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

    render() {
        return html`
            <rf-range-input
                min="0"
                max="100"
                step="1"
                .value=${this.rating}
                @value-change=${this.onRatingChange}></rf-range-input>
            <rf-rating-display .rating=${this.rating}></rf-rating-display>`
    }

    onRatingChange(event: ValueChangeEvent<number>) {
        this.rating = event.value
        this.dispatchEvent(new CustomEvent('rating-change', { detail: event.value }))
    }
}
