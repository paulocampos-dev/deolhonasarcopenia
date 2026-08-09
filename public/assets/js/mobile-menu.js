document.addEventListener('DOMContentLoaded', function () {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) return;

    button.addEventListener('click', function () {
        var nowHidden = menu.classList.toggle('hidden');
        button.setAttribute('aria-expanded', String(!nowHidden));
    });

    menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.add('hidden');
            button.setAttribute('aria-expanded', 'false');
        });
    });
});
