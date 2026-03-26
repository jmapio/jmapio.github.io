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
