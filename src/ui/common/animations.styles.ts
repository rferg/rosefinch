import { css } from 'lit-element'

export const animationsStyles = css`
    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    @keyframes slideInFromRight {
        0% {
            opacity: 0;
            transform: translateX(5%);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideInFromBottom {
        0% {
            opacity: 0;
            transform: translateY(5%);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
`
