const cards = document.querySelectorAll('.bento__card');

if (cards.length) {
    const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    );

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

        // Push card: dot race sequence
        const pushCard = document.querySelector('.bento__card--push');
        if (pushCard) {
            const pushObserver = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            pushObserver.unobserve(entry.target);
                        }
                    }
                },
                { threshold: 0.25 },
            );
            pushObserver.observe(pushCard);
        }
    }
}
