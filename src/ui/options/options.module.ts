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

export default {
    providers: [
        OptionsFormMapperService,
        ScaleService
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
        }
    ]
} as Module
