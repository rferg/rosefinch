import { Module } from '../core/module'
import { OptionsElement } from './options.element'
import { EditableTextInputElement } from './editable-text-input.element'

export default {
    providers: [],
    elements: [
        {
            element: OptionsElement,
            name: 'rf-options'
        },
        {
            element: EditableTextInputElement,
            name: 'rf-editable-text-input'
        }
    ]
} as Module
