document.addEventListener("keyup", e => {
    if (e.target instanceof HTMLInputElement) {
        const element = e.target
        if (element.hasAttribute('data-contact-search')) {
            contactSearchListener(element);
        }

        if (element.hasAttribute('data-file-search')) {
            fileSearchListener(element);
        }
    }
});

function contactSearchListener(element: HTMLInputElement) {
    const filter = element.value.toUpperCase().trim();
    const td = document.querySelectorAll("[data-message]");
    changeTableDataStyle(filter, td);
}

function fileSearchListener(element: HTMLInputElement) {
    const filter = element.value.toUpperCase().trim();
    const td = document.querySelectorAll("[data-file-name]");
    changeTableDataStyle(filter, td);
}

function changeTableDataStyle(filter: string, data: NodeListOf<Element>): void {
    for (let i = 0; i < data.length; i++) {
        const filterTargetValue = data[i].textContent.toUpperCase();
        const parent = document.querySelectorAll(".list-container")[i] as HTMLElement;
        if (filterTargetValue.indexOf(filter) > -1) {
            parent.style.display = "";
        } else {
            parent.style.display = "none";
        }
    }
}