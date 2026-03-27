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
        links.forEach((link) =>
            link.parentElement.classList.remove('highlight'),
        );
        const li = linkMap.get(id);
        if (li) {
            li.classList.add('highlight');
        }
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
}
