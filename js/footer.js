const jmapBackronyms = [
    'Just Mail, Actually Pleasant',
    'JSON Makes APIs Painless',
    'Jolly Messages Arrive Promptly',
    'Junk-free Mail Access Protocol',
    'Joyful Modern Applications Protocol',
    'JSON? Much Appreciated, Pal',
    'Jettison Messy Antiquated Protocols',
    'Juggling Mail, APIs, and Pushes',
    'Just Modernize All Protocols',
    'JSON-based Mail At Pace',
    'Jamming Mail Across Platforms',
    'Jumping Mailbox Access Party',
    'Judicious Management of Application Payloads',
    'Joining Mail And People',
];

let lastIndex = -1;
const getBackronym = () => {
    let index = Math.floor(Math.random() * jmapBackronyms.length);
    if (index === lastIndex) {
        index = (index + 1) % jmapBackronyms.length;
    }
    lastIndex = index;
    return jmapBackronyms[index];
};

const domBackronym = document.querySelector('.footer__backronym');
if (domBackronym) {
    domBackronym.textContent = getBackronym();
}

const domRandomizer = document.querySelector('.footer__randomizer');
if (domRandomizer && domBackronym) {
    domRandomizer.addEventListener('click', () => {
        domBackronym.setAttribute('aria-live', 'polite');
        domBackronym.textContent = getBackronym();
    });
}
