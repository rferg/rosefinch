import { Inject, Injectable } from 'cewdi'
import { css, property } from 'lit-element'
import { globalEventTargetToken } from '../../common/global-event-target-token'
import { animationsStyles } from '../common/animations.styles'
import { PendingStateEvent } from '../common/pending-state-event'
import { BaseElement } from './base-element'

@Injectable()
export class PendingElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            animationsStyles,
            css`
                :host {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    opacity: 0;
                    pointer-events: none;
                    height: var(--nav-border-top);
                    background-color: var(--danger-container-color);
                    z-index: calc(var(--nav-z-index) + 1);
                }
                :host([pending]) {
                    animation: fadeIn var(--animation-duration) var(--easing) 0.3s forwards;
                }
                :host([pending])::after {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 25vw;
                    animation: loading 1.5s var(--easing) 0.3s infinite;
                    z-index: calc(var(--nav-z-index) + 1);
                    background-color: var(--danger-color);
                    height: var(--nav-border-top);
                    opacity: 0;
                    border-radius: var(--border-radius);
                }
                @keyframes loading {
                    0% {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    50% {
                        transform: translateX(150%);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(400%);
                        opacity: 0;
                    }
                }
            `
        ]
    }

    @property({ reflect: true, type: Boolean })
    pending = false

    private _promises: Promise<any>[] = []
    private get promises(): Promise<any>[] {
        return this._promises
    }
    private set promises(val: Promise<any>[]) {
        if (val !== this._promises) {
            this._promises = val
            this.pending = !!this._promises.length
        }
    }

    constructor(@Inject(globalEventTargetToken) private readonly eventTarget: EventTarget) {
        super()
        this.onPendingStateEvent = this.onPendingStateEvent.bind(this)
        this.eventTarget.addEventListener(PendingStateEvent.is, this.onPendingStateEvent)
    }

    disconnectedCallback() {
        this.eventTarget.removeEventListener(PendingStateEvent.is, this.onPendingStateEvent)
    }

    private async onPendingStateEvent(ev: Event) {
        if (this.isPendingStateEvent(ev)) {
            ev.stopPropagation()
            try {
                this.promises = [ ...this.promises, ev.waitOn ]
                await ev.waitOn
            } catch (error) {
                console.error(error)
            } finally {
                this.promises = this.promises.filter(promise => promise !== ev.waitOn)
            }
        }
    }

    private isPendingStateEvent(ev: Event): ev is PendingStateEvent {
        return !!(ev as PendingStateEvent)?.waitOn
    }
}
