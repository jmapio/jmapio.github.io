const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const dotGrid = document.querySelector('.u-dot-grid--spotlight');
const main = document.querySelector('main');
if (dotGrid && main && !prefersReduced.matches) {
    let timeoutId;
    main.addEventListener('pointermove', (e) => {
        clearTimeout(timeoutId);
        dotGrid.classList.add('is-tracking');
        const rect = dotGrid.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        dotGrid.style.setProperty('--mouse-x', `${x}%`);
        dotGrid.style.setProperty('--mouse-y', `${y}%`);
        timeoutId = setTimeout(() => {
            dotGrid.classList.remove('is-tracking');
        }, 500);
    });
    main.addEventListener('pointerleave', (e) => {
        dotGrid.classList.remove('is-tracking');
    });
}

const cards = document.querySelectorAll('.bento__card');

if (cards.length) {
    if (prefersReduced.matches) {
        cards.forEach((card) => card.classList.add('in-view'));
    } else {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.25 },
        );

        cards.forEach((card) => observer.observe(card));
    }
}
