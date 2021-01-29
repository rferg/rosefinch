import { css } from 'lit-element'

export const linkLikeButtonStyles =
    css`
        button.link-like-button {
            outline: none;
            font-size: var(--font-size);
            border: none;
            background-color: transparent;
            text-decoration: underline;
            cursor: pointer;
            margin-top: var(--small-padding);
        }
        button.link-like-button, button.link-like-button > * {
            transition: color var(--animation-duration) var(--easing);
        }
        button.link-like-button:hover, button.link-like-button:hover > * {
            color: var(--medium-primary-color);
        }
    `
