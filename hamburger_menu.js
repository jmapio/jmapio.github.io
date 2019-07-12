document.addEventListener('DOMContentLoaded', function() {

    var menu = document.getElementById('nav');
    var hamburger_menu = document.createElement('div');
    hamburger_menu.id = "hamburger-menu";

    var hamburger_checkbox = document.createElement('input');
    hamburger_checkbox.type = "checkbox";

    hamburger_checkbox.addEventListener('change', function(event) {
        var checkbox = event.target;
        if(checkbox.checked) {
            menu.classList.add('activate');
        } else {
            menu.classList.remove('activate');
        }
    });
    hamburger_menu.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    menu.parentNode.insertBefore(hamburger_menu, menu.nextSibling);
    hamburger_menu.insertBefore(hamburger_checkbox, hamburger_menu.firstChild);
});