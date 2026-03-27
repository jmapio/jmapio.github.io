const toc = document.querySelector('.u-toc');
if (toc) {
    const links = toc.querySelectorAll('a[href^="#"]');
    const linkMap = new Map();
    const headings = [];

    links.forEach((link) => {
        const id = link.getAttribute('href').slice(1);
        const heading = document.getElementById(id);
        if (heading) {
            linkMap.set(id, link.parentElement);
            headings.push(heading);
        }
    });

    function setHighlight(id) {
        document
            .querySelectorAll('.u-toc li')
            .forEach((li) => li.classList.remove('highlight'));
        document.querySelectorAll('.u-toc').forEach((tocEl) => {
            const a = tocEl.querySelector(`a[href="#${CSS.escape(id)}"]`);
            if (a) {
                a.parentElement.classList.add('highlight');
            }
        });
    }

    // Highlight the first item by default
    if (headings.length) {
        setHighlight(headings[0].id);
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setHighlight(entry.target.id);
                }
            }
        },
        {
            rootMargin: '0px 0px -70% 0px',
        },
    );

    headings.forEach((h) => observer.observe(h));

    // --- FAB / Drawer ---

    const fab = document.getElementById('toc-fab');
    const drawer = document.getElementById('toc-drawer');
    const drawerNav = document.getElementById('toc-drawer-nav');

    if (fab && drawer && drawerNav) {
        drawerNav.appendChild(toc.cloneNode(true));

        const mql = window.matchMedia('(max-width: 768px)');

        function onMediaChange(e) {
            if (e.matches) {
                fab.hidden = false;
            } else {
                fab.hidden = true;
                closeDrawer();
            }
        }
        mql.addEventListener('change', onMediaChange);
        onMediaChange(mql);

        fab.addEventListener('click', openDrawer);

        drawer
            .querySelectorAll('[data-toc-close]')
            .forEach((el) => el.addEventListener('click', closeDrawer));

        drawerNav.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                closeDrawer();
            }
        });

        let previouslyFocused = null;

        function openDrawer() {
            previouslyFocused = document.activeElement;
            drawer.hidden = false;
            fab.setAttribute('aria-expanded', 'true');
            // Force reflow so transition applies
            drawer.offsetHeight;
            drawer.classList.add('is-open');
            document.body.style.overflow = 'hidden';

            const closeBtn = drawer.querySelector('.toc-drawer__close');
            if (closeBtn) {
                closeBtn.focus();
            }

            document.addEventListener('keydown', onDrawerKeydown);
        }

        function closeDrawer() {
            if (drawer.hidden) {
                return;
            }
            drawer.classList.remove('is-open');
            fab.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onDrawerKeydown);

            const panel = drawer.querySelector('.toc-drawer__panel');
            panel.addEventListener(
                'transitionend',
                () => {
                    drawer.hidden = true;
                },
                { once: true },
            );

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                drawer.hidden = true;
            }

            if (previouslyFocused) {
                previouslyFocused.focus();
            }
        }

        function onDrawerKeydown(e) {
            if (e.key === 'Escape') {
                closeDrawer();
                return;
            }
            if (e.key !== 'Tab') {
                return;
            }

            const focusable = drawer.querySelectorAll(
                'a[href], button:not([disabled])',
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
}
