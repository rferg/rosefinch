import { Module } from '../core/module'
import { EditRepresentativeElement } from './edit-representative.element'
import { RepresentativeElement } from './representative.element'
import { RepresentativesFitnessFormElement } from './representatives-fitness-form.element'
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
        },
        {
            element: RepresentativesFitnessFormElement,
            name: 'rf-representatives-fitness-form'
        }
    ]
} as Module
