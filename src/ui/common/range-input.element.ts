import { Injectable } from 'cewdi'
import { css, html, property, unsafeCSS } from 'lit-element'
import { BaseElement } from '../core/base-element'
import { ValueChangeEvent } from './value-change-event'

@Injectable()
export class RangeInputElement extends BaseElement {
    /*
        Vendor-prefixed rules need to be specified independently,
        since the browser will ignore selector if it doesn't recognize
        any part of it.
        reference: https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/
    */
    static get styles() {
        const thumbBorder = 'none'
        const thumbHeight = '1.5rem'
        const thumbWidth = '1.5rem'
        const thumbBorderRadius = '50%'
        const thumbBackgroundColor = 'var(--medium-primary-color)'
        const thumbBoxShadow = 'var(--primary-shadow)'
        const thumbTransform = 'scale(0.9)'
        const thumbTransition = 'background-color var(--animation-duration) var(--easing),' +
            ' transform var(--animation-duration) var(--easing)'
        const thumbCursor = 'pointer'

        const thumbHoverBackgroundColor = 'var(--primary-color)'
        const thumbHoverTransform = 'scale(1)'

        const thumbDisabledBackgroundColor = `var(--light-primary-color)`
        const thumbDisabledCursor = 'not-allowed'
        const thumbDisabledBoxShadow = 'none'
        const thumbDisabledTransform = 'none'

        const trackWidth = '100%'
        const trackHeight = '0.25rem'
        const trackCursor = 'pointer'
        const trackBorderRadius = 'var(--border-radius)'
        const trackBackgroundColor = thumbBackgroundColor
        const trackBoxShadow = 'var(--secondary-shadow)'
        const trackTransition = 'background-color var(--animation-duration) var(--easing)'

        const trackHoverBackgroundColor = thumbHoverBackgroundColor

        const trackDisabledBackgroundColor = thumbDisabledBackgroundColor
        const trackDisabledCursor = 'not-allowed'
        const trackDisabledBoxShadow = 'none'

        return [
            super.styles,
            css`
                input {
                    -webkit-appearance: none;
                    width: 100%;
                    background-color: transparent;
                    outline: none;
                }
                input::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    margin-top: -10px;
                    border: ${unsafeCSS(thumbBorder)};
                    height: ${unsafeCSS(thumbHeight)};
                    width: ${unsafeCSS(thumbWidth)};
                    border-radius: ${unsafeCSS(thumbBorderRadius)};
                    background-color: ${unsafeCSS(thumbBackgroundColor)};
                    box-shadow: ${unsafeCSS(thumbBoxShadow)};
                    transform: ${unsafeCSS(thumbTransform)};
                    transition: ${unsafeCSS(thumbTransition)};
                    cursor: ${unsafeCSS(thumbCursor)};
                }
                input:hover::-webkit-slider-thumb, input:focus::-webkit-slider-thumb {
                    background-color: ${unsafeCSS(thumbHoverBackgroundColor)};
                    transform: ${unsafeCSS(thumbHoverTransform)};
                }
                input:disabled::-webkit-slider-thumb {
                    background-color: ${unsafeCSS(thumbDisabledBackgroundColor)};
                    cursor: ${unsafeCSS(thumbDisabledCursor)};
                    box-shadow: ${unsafeCSS(thumbDisabledBoxShadow)};
                    transform: ${unsafeCSS(thumbDisabledTransform)};
                }
                input::-moz-range-thumb {
                    border: ${unsafeCSS(thumbBorder)};
                    height: ${unsafeCSS(thumbHeight)};
                    width: ${unsafeCSS(thumbWidth)};
                    border-radius: ${unsafeCSS(thumbBorderRadius)};
                    background-color: ${unsafeCSS(thumbBackgroundColor)};
                    box-shadow: ${unsafeCSS(thumbBoxShadow)};
                    transform: ${unsafeCSS(thumbTransform)};
                    transition: ${unsafeCSS(thumbTransition)};
                    cursor: ${unsafeCSS(thumbCursor)};
                }
                input:hover::-moz-range-thumb, input:focus::-moz-range-thumb {
                    background-color: ${unsafeCSS(thumbHoverBackgroundColor)};
                    transform: ${unsafeCSS(thumbHoverTransform)};
                }
                input:disabled::-moz-range-thumb {
                    background-color: ${unsafeCSS(thumbDisabledBackgroundColor)};
                    cursor: ${unsafeCSS(thumbDisabledCursor)};
                    box-shadow: ${unsafeCSS(thumbDisabledBoxShadow)};
                    transform: ${unsafeCSS(thumbDisabledTransform)};
                }
                input::-ms-thumb {
                    border: ${unsafeCSS(thumbBorder)};
                    height: ${unsafeCSS(thumbHeight)};
                    width: ${unsafeCSS(thumbWidth)};
                    border-radius: ${unsafeCSS(thumbBorderRadius)};
                    background-color: ${unsafeCSS(thumbBackgroundColor)};
                    box-shadow: ${unsafeCSS(thumbBoxShadow)};
                    transform: ${unsafeCSS(thumbTransform)};
                    transition: ${unsafeCSS(thumbTransition)};
                    cursor: ${unsafeCSS(thumbCursor)};
                }
                input:hover::-ms-thumb, input:focus::-ms-thumb {
                    background-color: ${unsafeCSS(thumbHoverBackgroundColor)};
                    transform: ${unsafeCSS(thumbHoverTransform)};
                }
                input:disabled::-ms-thumb {
                    background-color: ${unsafeCSS(thumbDisabledBackgroundColor)};
                    cursor: ${unsafeCSS(thumbDisabledCursor)};
                    box-shadow: ${unsafeCSS(thumbDisabledBoxShadow)};
                    transform: ${unsafeCSS(thumbDisabledTransform)};
                }
                input::-webkit-slider-runnable-track {
                    width: ${unsafeCSS(trackWidth)};
                    height: ${unsafeCSS(trackHeight)};
                    cursor: ${unsafeCSS(trackCursor)};
                    border-radius: ${unsafeCSS(trackBorderRadius)};
                    background-color: ${unsafeCSS(trackBackgroundColor)};
                    box-shadow: ${unsafeCSS(trackBoxShadow)};
                    transition: ${unsafeCSS(trackTransition)};
                }
                input:focus::-webkit-slider-runnable-track, input:hover::-webkit-slider-runnable-track {
                    background-color: ${unsafeCSS(trackHoverBackgroundColor)};
                }
                input:disabled::-webkit-slider-runnable-track {
                    background-color: ${unsafeCSS(trackDisabledBackgroundColor)};
                    cursor: ${unsafeCSS(trackDisabledCursor)};
                    box-shadow: ${unsafeCSS(trackDisabledBoxShadow)};
                }
                input::-moz-range-track {
                    width: ${unsafeCSS(trackWidth)};
                    height: ${unsafeCSS(trackHeight)};
                    cursor: ${unsafeCSS(trackCursor)};
                    border-radius: ${unsafeCSS(trackBorderRadius)};
                    background-color: ${unsafeCSS(trackBackgroundColor)};
                    box-shadow: ${unsafeCSS(trackBoxShadow)};
                    transition: ${unsafeCSS(trackTransition)};
                }
                input:focus::-moz-range-track, input:hover::-moz-range-track {
                    background-color: ${unsafeCSS(trackHoverBackgroundColor)};
                }
                input:disabled::-moz-range-track {
                    background-color: ${unsafeCSS(trackDisabledBackgroundColor)};
                    cursor: ${unsafeCSS(trackDisabledCursor)};
                    box-shadow: ${unsafeCSS(trackDisabledBoxShadow)};
                }
                input::-ms-track {
                    width: 100%;
                    cursor: pointer;
                    background: transparent;
                    border-color: transparent;
                    color: transparent;
                    width: ${unsafeCSS(trackWidth)};
                    height: ${unsafeCSS(trackHeight)};
                    cursor: ${unsafeCSS(trackCursor)};
                    border-radius: ${unsafeCSS(trackBorderRadius)};
                    background-color: ${unsafeCSS(trackBackgroundColor)};
                    box-shadow: ${unsafeCSS(trackBoxShadow)};
                    transition: ${unsafeCSS(trackTransition)};
                }
                input:focus::-ms-track, input:hover::-ms-track {
                    background-color: ${unsafeCSS(trackHoverBackgroundColor)};
                }
                input:disabled::-ms-track {
                    background-color: ${unsafeCSS(trackDisabledBackgroundColor)};
                    cursor: ${unsafeCSS(trackDisabledCursor)};
                    box-shadow: ${unsafeCSS(trackDisabledBoxShadow)};
                }
            `
        ]
    }

    @property()
    min = 0

    @property()
    max = 100

    @property()
    value?: number

    @property()
    step = 1

    @property({ reflect: true, type: Boolean })
    disabled = false

    render() {
        return html`
            <input type="range"
                    min="${this.min}"
                    max="${this.max}"
                    step="${this.step}"
                    ?disabled=${this.disabled}
                    .value=${this.value?.toString() ?? ''}
                    @input=${this.onChange}
                    />
        `
    }

    private onChange(event: Event) {
        const input = event.target as HTMLInputElement
        if (input) {
            const inputValue = input.value
            this.value = (inputValue && Number.parseFloat(inputValue)) || this.min
            this.dispatchEvent(new ValueChangeEvent<number>(this.value))
        }
    }
}
