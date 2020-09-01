import { Module } from '../core/module'
import { ContainerElement } from './container.element'
import { InsideContainerElement } from './inside-container.element'
import { IconElement } from './icon.element'

export default {
    providers: [],
    elements: [
        { name: 'rf-container', element: ContainerElement },
        { name: 'rf-inside-container', element: InsideContainerElement },
        { name: 'rf-icon', element: IconElement }
    ]
} as Module
