const RESET_DELAY_MS = 3000;

const templateIcons = document.querySelector('template#js-icons').content;
const svgCheck = templateIcons.querySelector('.i-check').outerHTML;
const svgCheckMicro = templateIcons.querySelector('.i-check-micro').outerHTML;
const svgClose = templateIcons.querySelector('.i-close').outerHTML;
const svgCloseMicro = templateIcons.querySelector('.i-close-micro').outerHTML;

const setupCopyButton = (domButton, getStates) => {
    const initialContent = domButton.innerHTML;
    const domClipboardContent = domButton.querySelector(
        '[data-clipboard-content]',
    );
    const states = { initial: initialContent, ...getStates(domButton) };
    const setState = (id) => {
        domButton.innerHTML = states[id] + domClipboardContent.outerHTML;
    };

    let timeout;
    domButton.addEventListener('click', async () => {
        clearTimeout(timeout);
        try {
            await navigator.clipboard.writeText(domClipboardContent.innerHTML);
            setState('success');
        } catch {
            setState('failure');
        }
        timeout = setTimeout(() => setState('initial'), RESET_DELAY_MS);
    });
};

document
    .querySelectorAll('[data-action="copy"].logo-card__button')
    .forEach((domButton) =>
        setupCopyButton(domButton, () => ({
            success: `<span>Copied</span>${svgCheck}`,
            failure: `<span>Unable to copy SVG</span>${svgClose}`,
        })),
    );

document
    .querySelectorAll('[data-action="copy"].color-card__button')
    .forEach((domButton) =>
        setupCopyButton(domButton, (button) => {
            const domValue = button.querySelector('.color-card__value');
            return {
                success: `${domValue.outerHTML}${svgCheckMicro}`,
                failure: `${domValue.outerHTML}${svgCloseMicro}`,
            };
        }),
    );
