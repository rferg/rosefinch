import { FormElement } from './form.element'
import { SizeForm } from './size-form'
import { css, html, TemplateResult } from 'lit-element'
import { FieldValidator } from './field-validator'
import { GeneUtil } from '../../common/gene-util'
import { numberRangeFieldValidatorFactory } from './number-range-field-validator-factory'
import { animationsStyles } from '../common/animations.styles'

export class SizeFormElement extends FormElement<SizeForm> {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    width: 100%;
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: center;
                    position: relative;
                }
                rf-inside-container {
                    justify-content: space-around;
                    align-items: center;
                    flex-wrap: wrap;
                    width: 100%;
                    margin: 1rem;
                    position: relative;
                }
                label {
                    margin: var(--small-padding);
                    text-align: right;
                }
                div {
                    display: inline-flex;
                    flex-flow: row nowrap;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .join {
                    margin: 0 var(--small-padding);
                }
                ul.errors {
                    background-color: var(--danger-container-color);
                    position: fixed;
                    padding: var(--small-padding);
                    bottom: var(--padding);
                    border-radius: var(--border-radius);
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    align-items: flex-start;
                    text-align: left;
                    animation: slideInFromBottom var(--animation-duration) var(--easing);
                    box-shadow: var(--primary-shadow);
                    border: 1px solid var(--danger-color);
                    pointer-events: none;
                    z-index: 2;
                }
                ul.errors li {
                    color: var(--danger-color);
                    font-size: var(--font-size);
                    list-style: none;
                }
                rf-tooltip {
                    top: 0;
                    left: 0.5rem;
                    position: absolute;
                }
            `
        ]
    }

    private readonly octaveOptions: { label: string, value: number }[] =
        [ ...new Array(GeneUtil.MAX_OCTAVE + 1) ].map((_, i) => {
            const value = i + GeneUtil.MIN_OCTAVE
            return { label: value.toString(), value }
        })

    private get minOctaveOptions(): { label: string, value: number }[] {
        const currentMaxOctave = this.value?.octaveMax
        if (currentMaxOctave !== undefined) {
            return this.octaveOptions.filter(({ value }) => value <= currentMaxOctave)
        } else {
            return this.octaveOptions
        }
    }

    private get maxOctaveOptions(): { label: string, value: number }[] {
        const currentMinOctave = this.value?.octaveMin
        if (currentMinOctave !== undefined) {
            return this.octaveOptions.filter(({ value }) => value >= currentMinOctave)
        } else {
            return this.octaveOptions
        }
    }

    private readonly fieldGroups: {
        label: string,
        joinTemplate: TemplateResult,
        tooltip?: string,
        fields: {
            name: keyof SizeForm,
            inputType: 'text' | 'number' | 'select',
            validator: FieldValidator,
            options?: () => { label: string, value: string | number }[]
        }[]
    }[] = [
        {
            label: 'Population Size',
            tooltip: 'This is the total number of sequences used in the genetic algorithm.  ' +
                'A larger number will increase the diversity of sequences, but may also increase the run time.  ' +
                'The minimum is 100 and the maximum is 10,000.',
            joinTemplate: html``,
            fields: [ {
                name: 'populationSize',
                inputType: 'number',
                validator: numberRangeFieldValidatorFactory(100, 10000, 'Population Size')
            } ]
        },
        {
            label: 'Time Signature',
            joinTemplate: html`<span class="join">/</span>`,
            fields: [
                {
                    name: 'timeSignatureTop',
                    inputType: 'number',
                    validator: numberRangeFieldValidatorFactory(1, 16, 'Time Signature Top Number')
                },
                {
                    name: 'timeSignatureBottom',
                    inputType: 'select',
                    validator: _ => ({ isValid: true }),
                    options: () => [
                        { label: '1', value: 1 },
                        { label: '2', value: 2 },
                        { label: '4', value: 4 },
                        { label: '8', value: 8 },
                        { label: '16', value: 16 }
                    ]
                }
            ]
        },
        {
            label: 'Measures',
            joinTemplate: html``,
            tooltip: 'The length of each sequence.  The minimum is 1 and the maximum is 10.',
            fields: [ {
                name: 'measures',
                inputType: 'number',
                validator: numberRangeFieldValidatorFactory(1, 10, 'Measures')
            } ]
        },
        {
            label: 'Shortest Note',
            joinTemplate: html``,
            fields: [ {
                name: 'shortestNoteDuration',
                inputType: 'select',
                validator: _ => ({ isValid: true }),
                options: () => [
                    { label: 'Whole', value: 1 },
                    { label: 'Half', value: 2 },
                    { label: 'Quarter', value: 4 },
                    { label: 'Eighth', value: 8 },
                    { label: 'Sixteenth', value: 16 }
                ]
            } ]
        },
        {
            label: 'Octave Range',
            tooltip: 'Octaves are numbered according to scientific pitch notation.  ' +
                'For reference, octave 4 contains Middle C (on a standard 88-key piano).',
            joinTemplate: html`<span class="join">to</span>`,
            fields: [
                {
                    name: 'octaveMin',
                    inputType: 'select',
                    validator: _ => ({ isValid: true }),
                    options: () => this.minOctaveOptions
                },
                {
                    name: 'octaveMax',
                    inputType: 'select',
                    validator: _ => ({ isValid: true }),
                    options: () => this.maxOctaveOptions
                }
            ]
        }
    ]

    render() {
        return html`${this.fieldGroups.map(({ label, tooltip, joinTemplate, fields }) => {
            const errors = Object.keys(this.errors)
                .map(key => this.errors[key])
                .filter(err => !!(err?.length))
                .reduce((prev, curr) => prev.concat(curr), [])
            return html`
                ${errors.length
                    ? html`<ul class="errors">${errors.map(err => html`<li>${err}</li>`)}</ul>`
                    : html``}
                <rf-inside-container>
                    ${ tooltip ? html`<rf-tooltip .text=${tooltip || ''}></rf-tooltip>` : html`` }
                    <label>${label}</label>
                    <div>
                    ${fields.map(({ name, inputType, validator, options }, i) => {
                        const template = html`
                            <rf-input
                                name=${name}
                                inputType=${inputType}
                                .value=${this.value?.[name]}
                                .validator=${validator}
                                .options=${options ? options() : []}>
                            </rf-input>
                        `
                        return i ? html`${joinTemplate}${template}` : template
                    })}
                    </div>
                </rf-inside-container>
            `
        })}`
    }
}
