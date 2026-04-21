const button = document.getElementById('theme-toggle');

const updateLabel = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    button.setAttribute('aria-label', `Switch to ${next} theme`);
};

updateLabel();

button.addEventListener('click', function () {
    const isLight =
        (localStorage.getItem('jmap-theme') ||
            document.documentElement.getAttribute('data-theme')) === 'light';
    document.documentElement.setAttribute(
        'data-theme',
        isLight ? 'dark' : 'light',
    );
    localStorage.setItem('jmap-theme', isLight ? 'dark' : 'light');
    updateLabel();
});
