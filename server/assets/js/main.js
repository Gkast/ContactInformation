document.addEventListener("keyup", e => {
    if (e.target instanceof HTMLInputElement) {
        const element = e.target;
        if (element.hasAttribute('data-contact-search')) {
            contactSearchListener(element);
        }
        if (element.hasAttribute('data-file-search')) {
            fileSearchListener(element);
        }
    }
});
function contactSearchListener(element) {
    const filter = element.value.toUpperCase().trim();
    const td = document.querySelectorAll("[data-message]");
    changeTableDataStyle(filter, td);
}
function fileSearchListener(element) {
    const filter = element.value.toUpperCase().trim();
    const td = document.querySelectorAll("[data-file-name]");
    changeTableDataStyle(filter, td);
}
function changeTableDataStyle(filter, data) {
    for (let i = 0; i < data.length; i++) {
        const filterTargetValue = data[i].textContent.toUpperCase();
        const parent = document.querySelectorAll(".list-container")[i];
        if (filterTargetValue.indexOf(filter) > -1) {
            parent.style.display = "";
        }
        else {
            parent.style.display = "none";
        }
    }
}
document.addEventListener('submit', (e) => {
    if (e.target instanceof HTMLFormElement) {
        const element = e.target;
        if (element.hasAttribute('data-captcha-form')) {
            captchaListener(element);
        }
        if (element.hasAttribute('data-confirm-text')) {
            if (!confirm(element.getAttribute('data-confirm-text'))) {
                confirmTextListener(element);
            }
        }
    }
});
function captchaListener(element) {
    if (!grecaptcha.getResponse()) {
        element.preventDefault();
        console.error("captcha not completed");
    }
}
function confirmTextListener(element) {
    element.preventDefault();
}
