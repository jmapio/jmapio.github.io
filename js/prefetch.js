const prefetch = (url) => {
    const urls = [].concat(url);
    const toFetch = [];
    for (const _url of urls) {
        if (prefetchedUrls.has(_url)) {
            continue;
        }
        prefetchedUrls.add(_url);
        toFetch.push(
            new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = _url;

                link.onload = resolve;
                link.onerror = reject;

                document.head.appendChild(link);
            }),
        );
    }
    return Promise.allSettled(toFetch);
};

const parseUrl = (url) => {
    try {
        return new URL(url);
    } catch {
        return null;
    }
};

const shouldIgnoreURL = (url) => {
    const parsed = parseUrl(url);
    if (!parsed) {
        return true;
    }
    if (location.origin !== parsed.origin) {
        return true;
    }
    if (location.pathname === parsed.pathname) {
        return true;
    }
    return false;
};

const getClosest = (el, tag) => {
    try {
        return el.closest(tag);
    } catch {
        return null;
    }
};

const getPrefetchableAnchor = (el) => {
    const anchor = getClosest(el, 'a');
    if (
        !anchor ||
        prefetchedUrls.has(anchor.href) ||
        shouldIgnoreURL(anchor.href)
    ) {
        return null;
    }
    return anchor;
};

const mouseOutListener = (event) => {
    if (
        event.relatedTarget &&
        getClosest(event.target, 'a') === getClosest(event.relatedTarget, 'a')
    ) {
        return;
    }
    if (mouseEventTimer) {
        clearTimeout(mouseEventTimer);
        mouseEventTimer = null;
    }
};

const prefetchedUrls = new Set();
let mouseEventTimer = null;
const MOUSE_EVENT_DELAY = 65; // ms

const canPrefetch = (() => {
    const link = document.createElement('link');
    return !!link?.relList?.supports?.('prefetch');
})();

if (canPrefetch) {
    document.addEventListener(
        'mouseover',
        (event) => {
            const anchor = getPrefetchableAnchor(event.target);
            if (!anchor) {
                return;
            }

            anchor.addEventListener('mouseout', mouseOutListener, {
                passive: true,
            });

            mouseEventTimer = setTimeout(() => {
                prefetch(anchor.href);
                mouseEventTimer = null;
            }, MOUSE_EVENT_DELAY);
        },
        { capture: true, passive: true },
    );

    document.addEventListener(
        'touchstart',
        (event) => {
            const anchor = getPrefetchableAnchor(event.target);
            if (!anchor) {
                return;
            }

            prefetch(anchor.href);
        },
        { capture: true, passive: true },
    );
}
