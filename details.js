// <details> polyfill. Caveats:
//
// - Each <details> must have a <summary> as its first element child
//   (a default summary of “Details” is *not* generated);
// - Each <details> must not have any significant text nodes as immediate
//   descentents (wrap them in a div or something);
// - No polyfilling is performed for the `trigger` event;
// - Dynamically inserted <details> elements are ignored.

(function ( document, DETAILS ) {

if ( 'open' in document.createElement( 'details' ) ) {
    return;
}

Object.defineProperty( Element.prototype, 'open', {
    get () {
        if ( this.nodeName === DETAILS ) {
            return this.hasAttribute( 'open' );
        }
    },
    set ( booleanValue ) {
        if ( this.nodeName === DETAILS && this.open === !booleanValue ) {
            this[ booleanValue ? 'setAttribute' : 'removeAttribute' ]( 'open', '' );
        }
    }
});

document.querySelector( 'head' ).insertAdjacentHTML( 'afterbegin',
    '<style>details,details>summary{display:block}details:not([open])>:not(summary){display:none}</style>' );

function handleKeyPress ( event ) {
    const keyCode = event.keyCode;
    if ( keyCode === 13 || keyCode === 32 ) {
        event.preventDefault();
    }
}

function handleKeyUp ( event ) {
    const keyCode = event.keyCode;
    if ( keyCode === 13 || keyCode === 32 ) {
        const details = this.parentNode;
        details.open = !details.open;
        event.preventDefault();
    }
}

function handleClick ( event ) {
    if ( !( event.defaultPrevented || event.which > 1 || event.altKey ||
            event.ctrlKey || event.metaKey || event.shiftKey ||
            event.target.isContentEditable ) ) {
        const details = this.parentNode;
        details.open = !details.open;
        event.preventDefault();
    }
}

Array.prototype.forEach.call(
    /*document.getElementsByTagName( 'details' ),
    details => {
        const summary = details.firstElementChild;
        if ( summary.nodeName !== 'SUMMARY' ) {
            details.insertAdjacentHTML( 'afterbegin', '<summary>Details</summary>' );
        }*/
    document.getElementsByTagName( 'summary' ),
    summary => {
        summary.legend = true;
        summary.tabIndex = 0;
        summary.addEventListener( 'click', handleClick, false );
        summary.addEventListener( 'keypress', handleKeyPress, false );
        summary.addEventListener( 'keyup', handleKeyUp, false );
    }
);

})( document, 'DETAILS' );