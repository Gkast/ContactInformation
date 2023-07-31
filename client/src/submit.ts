document.addEventListener('submit', (e) => {
    if (e.target instanceof HTMLFormElement) {
        const element = e.target;
        if (element.hasAttribute('data-captcha-form')) {
            captchaListener(element);
        }

        if (element.hasAttribute('data-confirm-text')) {
            if (!confirm(element.getAttribute('data-confirm-text'))) {
                confirmTextListener(element)
            }
        }
    }
});

function captchaListener(element: HTMLFormElement) {
    if (!grecaptcha.getResponse()) {
        element.preventDefault();
        console.error("captcha not completed");
    }
}

function confirmTextListener(element: HTMLFormElement) {
    element.preventDefault();
}