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
            <rf-genome-notation .genome=${[ 66, 66, 68, 76 ]} .options=${
                {
                    timeSignature: [ 4, 1 ],
                    measures: 1,
                    shortestNoteDuration: 1
                } as SerializedGeneticAlgorithmOptions
            }></rf-genome-notation>
            `
    }
}
