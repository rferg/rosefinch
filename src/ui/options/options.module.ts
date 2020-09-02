import { Module } from '../core/module'
import { OptionsElement } from './options.element'

export default {
    providers: [],
    elements: [
        {
            element: OptionsElement,
            name: 'rf-options'
        }
    ]
} as Module
