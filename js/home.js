const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const hero = document.querySelector('.hero--landing');
if (hero && !prefersReduced.matches) {
    hero.classList.add('not-tracking');
    hero.addEventListener('pointerover', () => {
        hero.classList.add('is-tracking');
    });
    hero.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--mouse-x', `${x}%`);
        hero.style.setProperty('--mouse-y', `${y}%`);
    });
    hero.addEventListener('pointerleave', (e) => {
        hero.classList.remove('is-tracking');
        hero.style.setProperty('--mouse-x', '70%');
        hero.style.setProperty('--mouse-y', '10%');
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
