document.addEventListener('submit', (e) => {
    if (e.target instanceof HTMLFormElement) {
        const element = e.target;
        if (element.hasAttribute('data-captcha-form')) {
            if (!grecaptcha.getResponse()) {
                element.preventDefault();
                console.error("captcha not completed");
            }
        }
        if (element.hasAttribute('data-confirm-text')) {
            if (!confirm(element.getAttribute('data-confirm-text'))) {
                element.preventDefault();
            }
        }
    }
});
