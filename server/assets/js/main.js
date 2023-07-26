document.addEventListener('submit', (e) => {
    if (e.target instanceof HTMLFormElement && e.target.hasAttribute('data-captcha-form')) {
        if (!grecaptcha.getResponse()) {
            e.preventDefault();
            console.error("captcha not completed");
        }
    }

    if (e.target instanceof HTMLFormElement && e.target.hasAttribute('data-confirm-text')) {
        if (!confirm(e.target.getAttribute('data-confirm-text'))) {
            e.preventDefault();
        }
    }
})

document.addEventListener("keyup", e => {
    if (e.target instanceof HTMLElement && e.target.hasAttribute('data-contact-search')) {
        let filter, pre, i, txtValue, td;
        filter = e.target.value.toUpperCase().trim();
        td = document.querySelectorAll("[data-message]");
        for (i = 0; i < td.length; i++) {
            pre = td[i].getElementsByTagName("pre")[0];
            txtValue = pre.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                td[i].parentElement.style.display = "";
            } else {
                td[i].parentElement.style.display = "none";
            }
        }
    }

    if (e.target instanceof HTMLElement && e.target.hasAttribute('data-file-search')) {
        let filter, span, i, txtValue, td;
        filter = e.target.value.toUpperCase().trim();
        td = document.querySelectorAll("[data-file-name]");
        for (i = 0; i < td.length; i++) {
            span = td[i].getElementsByTagName("span")[0];
            txtValue = span.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                td[i].parentElement.style.display = "";
            } else {
                td[i].parentElement.style.display = "none";
            }
        }
    }
})