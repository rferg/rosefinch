import { BaseElement } from '../core/base-element'
import { css, html, property } from 'lit-element'
import { headingsStyles } from '../common/headings.styles'
import { Icon } from '../common/icon'
import { SizeForm } from './size-form'
import { FormSubmitEvent } from './form-submit-event'
import { FitnessForm } from './fitness-form'
import { animationsStyles } from '../common/animations.styles'

export class OptionsElement extends BaseElement {
    static get styles() {
        return [
            super.styles,
            headingsStyles,
            animationsStyles,
            css`
                :host {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    justify-content: center;
                    align-items: center;
                }
                rf-container {
                    flex-grow: 0;
                    width: 960px;
                    max-width: 100vw;
                }
                rf-form-tab, rf-size-form, rf-fitness-form {
                    width: 100%;
                }
                rf-form-tab {
                    opacity: 0;
                    bottom: 0;
                    position: absolute;
                    pointer-events: none;
                }
                rf-form-tab[data-active] {
                    opacity: 1;
                    transform: translateX(0);
                    position: relative;
                    pointer-events: auto;
                    animation: slideInFromRight var(--animation-duration) var(--easing);
                }
                div.headings {
                    width: 100%;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    border-bottom: 1px solid var(--light-primary-color);
                    margin-bottom: var(--padding);
                }
                div.contents {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                h3 {
                    margin-top: 0;
                }
                h4 {
                    margin-top: 0;
                    font-weight: var(--regular-weight);
                    color: var(--light-primary-color);
                    margin-bottom: -1px;
                    transition: color var(--animation-duration) var(--easing),
                        border-color var(--animation-duration) var(--easing);
                    padding: var(--small-padding);
                }
                h4[data-active] {
                    color: var(--primary-color);
                    border-bottom: 1px solid var(--primary-color);
                }
            `
        ]
    }

    @property({ reflect: true, type: String })
    activeTab: 'size' | 'fitness' = 'size'

    private readonly sizeForm: SizeForm = {
        populationSize: 5000,
        timeSignatureTop: 4,
        timeSignatureBottom: 4,
        octaveMax: 6,
        octaveMin: 3,
        shortestNoteDuration: 8,
        measures: 8
    }

    private readonly fitnessForm: FitnessForm = {
        chords: { weight: 1 },
        scale: { weight: 1 },
        restProportion: { weight: 1 },
        pitchSequence: { weight: 1 },
        rhythmicDispersion: { weight: 1 }
    }

    render() {
        return html`
            <rf-container>
                <h3>New Session</h3>
                <div class="headings">
                    <h4 ?data-active=${this.activeTab === 'size'}>Size</h4>
                    <h4 ?data-active=${this.activeTab === 'fitness'}>Fitness</h4>
                </div>
                <div class="contents">
                    <rf-form-tab ?data-active=${this.activeTab === 'size'}
                        .submitButton=${{ role: 'primary' as 'primary', icon: Icon.RightArrow }}
                        @form-submit=${this.onSizeSubmit}>
                        <rf-size-form .value=${this.sizeForm} slot="form"></rf-size-form>
                    </rf-form-tab>
                    <rf-form-tab ?data-active=${this.activeTab === 'fitness'}
                        .submitButton=${{ role: 'success' as 'success', icon: Icon.Check }}
                        .backButton=${{ role: 'primary' as 'primary', icon: Icon.LeftArrow }}
                        @tab-back=${this.onFitnessBack}
                        @form-submit=${this.onFitnessSubmit}>
                        <rf-fitness-form .value=${this.fitnessForm} slot="form"></rf-fitness-form>
                    </rf-form-tab>
                </div>
            </rf-container>
        `
    }

    private onSizeSubmit(ev: FormSubmitEvent<SizeForm>) {
        console.log(ev)
        this.activeTab = 'fitness'
    }

    private onFitnessBack() {
        this.activeTab = 'size'
    }

    private onFitnessSubmit(ev: FormSubmitEvent<FitnessForm>) {
        console.log(ev)
    }
}
