import { Module } from '../core/module'
import { RepresentativesElement } from './representatives.element'

export default {
    providers: [

    ],
    elements: [
        {
            element: RepresentativesElement,
            name: 'rf-representatives'
        }
    ]
} as Module
