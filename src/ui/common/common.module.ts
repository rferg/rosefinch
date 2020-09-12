import { Module } from '../core/module'
import { ContainerElement } from './container.element'
import { InsideContainerElement } from './inside-container.element'
import { IconElement } from './icon.element'
import { ButtonElement } from './button.element'
import { TooltipElement } from './tooltip.element'
import { getProviders as getStorageProviders } from '../../storage'

export default {
    providers: [
        ...getStorageProviders()
    ],
    elements: [
        { name: 'rf-container', element: ContainerElement },
        { name: 'rf-inside-container', element: InsideContainerElement },
        { name: 'rf-icon', element: IconElement },
        { name: 'rf-button', element: ButtonElement },
        { name: 'rf-tooltip', element: TooltipElement }
    ]
} as Module
