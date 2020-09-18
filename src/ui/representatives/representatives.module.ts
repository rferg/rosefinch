import { Module } from '../core/module'
import { EditRepresentativeElement } from './edit-representative.element'
import { RepresentativeElement } from './representative.element'
import { RepresentativesHeaderElement } from './representatives-header.element'
import { RepresentativesElement } from './representatives.element'

export default {
    providers: [

    ],
    elements: [
        {
            element: RepresentativesElement,
            name: 'rf-representatives'
        },
        {
            element: RepresentativesHeaderElement,
            name: 'rf-representatives-header'
        },
        {
            element: EditRepresentativeElement,
            name: 'rf-edit-representative'
        },
        {
            element: RepresentativeElement,
            name: 'rf-representative'
        }
    ]
} as Module
