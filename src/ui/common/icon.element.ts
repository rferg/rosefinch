import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { Icon } from './icon'

import check from '../../../assets/images/icons/check.svg'
import cross from '../../../assets/images/icons/cross.svg'
import download from '../../../assets/images/icons/download.svg'
import leftArrow from '../../../assets/images/icons/left-arrow.svg'
import pause from '../../../assets/images/icons/pause.svg'
import play from '../../../assets/images/icons/play.svg'
import plus from '../../../assets/images/icons/plus.svg'
import rightArrow from '../../../assets/images/icons/right-arrow.svg'
import sliders from '../../../assets/images/icons/sliders.svg'
import volume from '../../../assets/images/icons/volume.svg'

export class IconElement extends BaseElement {
    static get styles() {
        return css`
            img {
                height: var(--font-size);
            }
        `
    }

    @property()
    icon?: Icon

    @property()
    height?: string

    private readonly iconMap: { [key in Icon]: string } = {
        [Icon.Check]: check,
        [Icon.Cross]: cross,
        [Icon.Download]: download,
        [Icon.LeftArrow]: leftArrow,
        [Icon.Pause]: pause,
        [Icon.Play]: play,
        [Icon.Plus]: plus,
        [Icon.RightArrow]: rightArrow,
        [Icon.Sliders]: sliders,
        [Icon.Volume]: volume
    }

    render() {
        return this.icon
            ? html`<img alt=${this.icon} src=${this.getSrc(this.icon)} style="height:${this.height || ''}" />`
            : html``
    }

    private getSrc(icon: Icon): string {
        return this.iconMap[icon]
    }
}
