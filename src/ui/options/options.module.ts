import { Module } from '../core/module'
import { OptionsElement } from './options.element'
import { InputElement } from './input.element'
import { FormTabElement } from './form-tab.element'
import { SizeFormElement } from './size/size-form.element'
import { FitnessFormElement } from './fitness/fitness-form.element'
import { PopupElement } from './popup.element'
import { RunConfirmFormElement } from './run-confirm-form.element'
import { OptionsFormMapperService } from '../../services/options-form-mapper-service'
import { ChordService, ScaleService } from '../../services'
import { getProviders as getNotationProviders } from '../../services/notation'
import { GenomeNotationElement } from './notation/genome-notation.element'
import { FitnessFormItemElement } from './fitness/fitness-form-item.element'
import { ScaleFitnessElement } from './fitness/scale-fitness.element'
import { RestProportionFitnessElement } from './fitness/rest-proportion-fitness.element'
import { FitnessFormItemButtonsElement } from './fitness/fitness-form-item-buttons.element'
import { RhythmicDispersionFitnessElement } from './fitness/rhythmic-dispersion-fitness.element'
import { PitchSequenceDirectionFitnessElement } from './fitness/pitch-sequence-direction-fitness.element'

export default {
    providers: [
        ChordService,
        OptionsFormMapperService,
        ScaleService,
        ...getNotationProviders()
    ],
    elements: [
        {
            element: OptionsElement,
            name: 'rf-options'
        },
        {
            element: InputElement,
            name: 'rf-input'
        },
        {
            element: FormTabElement,
            name: 'rf-form-tab'
        },
        {
            element: SizeFormElement,
            name: 'rf-size-form'
        },
        {
            element: FitnessFormElement,
            name: 'rf-fitness-form'
        },
        {
            element: PopupElement,
            name: 'rf-popup'
        },
        {
            element: RunConfirmFormElement,
            name: 'rf-run-confirm-form'
        },
        {
            element: GenomeNotationElement,
            name: 'rf-genome-notation'
        },
        {
            element: FitnessFormItemElement,
            name: 'rf-fitness-form-item'
        },
        {
            element: ScaleFitnessElement,
            name: 'rf-scale-fitness'
        },
        {
            element: RestProportionFitnessElement,
            name: 'rf-rest-proportion-fitness'
        },
        {
            element: FitnessFormItemButtonsElement,
            name: 'rf-fitness-form-item-buttons'
        },
        {
            element: RhythmicDispersionFitnessElement,
            name: 'rf-rhythmic-dispersion-fitness'
        },
        {
            element: PitchSequenceDirectionFitnessElement,
            name: 'rf-pitch-sequence-direction-fitness'
        }
    ]
} as Module
