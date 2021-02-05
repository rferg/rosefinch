import { Module } from '../core/module'
import { OptionsElement } from './options.element'
import { InputElement } from './input.element'
import { FormTabElement } from './form-tab.element'
import { SizeFormElement } from './size-form.element'
import { FitnessFormElement } from './fitness-form.element'
import { PopupElement } from './popup.element'
import { RunConfirmFormElement } from './run-confirm-form.element'
import { OptionsFormMapperService } from '../../services/options-form-mapper-service'
import { ScaleService } from '../../services'
import { getProviders as getNotationProviders } from '../../services/notation'
import { GenomeNotationElement } from './notation/genome-notation.element'
import { FitnessFormItemElement } from './fitness-form-item.element'
import { ScaleFitnessElement } from './scale-fitness.element'
import { RestProportionFitnessElement } from './rest-proportion-fitness.element'
import { FitnessFormItemButtonsElement } from './fitness-form-item-buttons.element'

export default {
    providers: [
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
        }
    ]
} as Module
