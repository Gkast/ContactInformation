document.addEventListener('submit', (e) => {
    if (e.target instanceof HTMLFormElement) {
        if (e.target.hasAttribute('data-captcha-form')){
            if (!grecaptcha.getResponse()) {
                e.preventDefault();
                console.error("captcha not completed");
            }
        }

        if (e.target.hasAttribute('data-confirm-text')) {
            if (!confirm(e.target.getAttribute('data-confirm-text'))) {
                e.preventDefault();
            }
        }
    }
})