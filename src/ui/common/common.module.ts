import { Module } from '../core/module'
import { ContainerElement } from './container.element'
import { InsideContainerElement } from './inside-container.element'
import { IconElement } from './icon.element'
import { ButtonElement } from './button.element'
import { TooltipElement } from './tooltip.element'
import { getProviders as getStorageProviders } from '../../storage'
import { RangeInputElement } from './range-input.element'
import { UuidService } from '../../common/uuid-service'
import { OptionsTemplateService } from '../../services/options-template.service'

export default {
    providers: [
        ...getStorageProviders(),
        OptionsTemplateService,
        UuidService
    ],
    elements: [
        { name: 'rf-container', element: ContainerElement },
        { name: 'rf-inside-container', element: InsideContainerElement },
        { name: 'rf-icon', element: IconElement },
        { name: 'rf-button', element: ButtonElement },
        { name: 'rf-tooltip', element: TooltipElement },
        { name: 'rf-range-input', element: RangeInputElement }
    ]
} as Module
