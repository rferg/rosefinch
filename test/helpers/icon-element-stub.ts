import { Icon } from '../../src/ui/common/icon'
import { BaseElement } from '../../src/ui/core/base-element'
import { property } from 'lit-element'

export class IconElementStub extends BaseElement {
    static get is() { return 'rf-icon' }

    @property()
    icon?: Icon
    @property()
    height?: string
}
