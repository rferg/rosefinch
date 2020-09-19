import { css } from 'lit-element'

export const scrollbarStyles = css`
    ::-webkit-scrollbar {
            width: 0.6rem;
        }
    ::-webkit-scrollbar-track {
        background: var(--container-background-color);
    }
    ::-webkit-scrollbar-thumb {
        background-color: var(--primary-color) ;
        border-radius: var(--border-radius);
        border: 3px solid var(--container-background-color);
    }
`
