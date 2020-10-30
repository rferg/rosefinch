import { FormElement } from './form.element'
import { css, html } from 'lit-element'
import { FitnessForm } from './fitness-form'
import { Injectable } from 'cewdi'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'

@Injectable()
export class FitnessFormElement extends FormElement<FitnessForm> {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    render() {
        return html`
            <div style="height:60vh;">fitness form</div>
            <rf-genome-notation .genome=${[ 65, 65, 67, 77 ]} .options=${
                {
                    timeSignature: [ 4, 4 ],
                    measures: 1,
                    shortestNoteDuration: 4
                } as SerializedGeneticAlgorithmOptions
            }></rf-genome-notation>
            `
    }
}
