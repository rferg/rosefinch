import { FormElement } from './form.element'
import { css, html } from 'lit-element'
import { FitnessForm } from './fitness-form'
import { Injectable } from 'cewdi'
import { SerializedGeneticAlgorithmOptions } from '../../genetic-algorithm'
import { GeneUtil } from '../../common/gene-util'
import { Uint8 } from '../../common/uint8'
import { Pitch } from '../../common/pitch'

@Injectable()
export class FitnessFormElement extends FormElement<FitnessForm> {
    static get styles() {
        return [
            super.styles,
            css``
        ]
    }

    render() {
        const notes = [ 65, 65, 78, 81 ] as Uint8[]
        console.log(notes.map((n) => `${Pitch[GeneUtil.getPitch(n)]} ${GeneUtil.getOctave(n)}`).join(','))
        return html`
            <div style="height:60vh;">fitness form</div>
            <rf-genome-notation .genome=${notes} .options=${
                {
                    timeSignature: [ 4, 4 ],
                    measures: 1,
                    shortestNoteDuration: 4
                } as SerializedGeneticAlgorithmOptions
            }></rf-genome-notation>
            `
    }
}
