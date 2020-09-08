import { Module } from '../core/module'
import { OptionsElement } from './options.element'
import { InputElement } from './input.element'
import { FormTabElement } from './form-tab.element'
import { SizeFormElement } from './size-form.element'

export default {
    providers: [],
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
        }
    ]
} as Module
