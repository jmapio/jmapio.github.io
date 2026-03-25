document.getElementById('theme-toggle').addEventListener('click', function () {
    const isLight =
        (localStorage.getItem('jmap-theme') ||
            document.documentElement.getAttribute('data-theme')) === 'light';
    document.documentElement.setAttribute(
        'data-theme',
        isLight ? 'dark' : 'light',
    );
    localStorage.setItem('jmap-theme', isLight ? 'dark' : 'light');
});
document.getElementById('hamburger').addEventListener('click', function () {
    const nl = document.getElementById('nav-links');
    const o = nl.classList.toggle('open');
    this.setAttribute('aria-expanded', o);
});
