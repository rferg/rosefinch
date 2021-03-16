import { property } from 'lit-element'
import { BaseElement } from '../../src/ui/core/base-element'
import { ModuleName } from '../../src/ui/core/module-name'

export class RouterOutletElementStub extends BaseElement {
    static get is() { return 'rf-router-outlet' }

    @property()
    moduleName?: ModuleName
}
