document.addEventListener("keyup", e => {
    if (e.target instanceof HTMLInputElement) {
        if (e.target.hasAttribute('data-contact-search')) {
            const filter = e.target.value.toUpperCase().trim();
            const td = document.querySelectorAll("[data-message]");
            changeTableDataStyle(filter, td, 'pre');
        }

        if (e.target.hasAttribute('data-file-search')) {
            const filter = e.target.value.toUpperCase().trim();
            const td = document.querySelectorAll("[data-file-name]");
            changeTableDataStyle(filter, td, 'span');
        }
    }
})

function changeTableDataStyle(filter: string, tableData: NodeListOf<Element>, filterTarget: string): void {
    for (let i = 0; i < tableData.length; i++) {
        const filterTargetValue = tableData[i].getElementsByTagName(filterTarget)[0].textContent.toUpperCase();
        const parent = tableData[i].parentElement;
        if (filterTargetValue.indexOf(filter) > -1) {
            parent.style.display = "";
        } else {
            parent.style.display = "none";
        }
    }
}