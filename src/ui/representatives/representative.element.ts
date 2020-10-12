import { html } from '@open-wc/testing-helpers'
import { Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { GeneUtil } from '../../common/gene-util'
import { Pitch } from '../../common/pitch'
import { Uint8 } from '../../common/uint8'
import { BaseElement } from '../core/base-element'

@Injectable()
export class RepresentativeElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    width: 100%;
                    cursor: pointer;
                }
                rf-inside-container {
                   display: flex;
                   flex-flow: column nowrap;
                   align-items: center;
                   justify-content: center;
                   border: solid 0.25rem transparent;
                   cursor: pointer;
                   transition: background-color var(--short-animation-duration) var(--easing);
                }
                rf-inside-container:hover {
                    background-color: var(--light-primary-color);
                }
                :host([active]) rf-inside-container {
                    background-color: var(--light-primary-color);
                    border-color: var(--primary-color);
                }
                p {
                    max-width: 15rem;
                    overflow: hidden;
                    word-wrap: none;
                    word-break: none;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    margin: 0.25rem 0;
                }
            `
        ]
    }

    @property({ reflect: false })
    genome?: number[]

    @property({ reflect: true, type: Number })
    rating = 0

    @property({ reflect: true, type: Boolean })
    active = false

    render() {
        return html`
            <rf-inside-container>
                <p>${this.getGenomeRepresentation()}</p>
                <rf-rating-display .rating=${this.rating}></rf-rating-display>
            </rf-inside-container>
        `
    }

    private getGenomeRepresentation(): string {
        return (this.genome || [])
            .map(gene => ({ pitch: GeneUtil.getPitch(gene as Uint8), octave: GeneUtil.getOctave(gene as Uint8) }))
            .filter(({ pitch }) => pitch !== Pitch.Hold)
            .map(({ pitch, octave }) => `${Pitch[pitch]}${octave}`)
            .join(' ')
    }
}
