( function ( window, document ) {

"use strict";

var modal = document.getElementById( 'videoLightbox' );
var player = document.getElementById( 'videoPlayer' );

function hidePopup () {
    modal.style.display = 'none';
    player.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
}

function showPopup () {
    modal.style.display = 'block';
    player.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
}

// Open the popup screen when users click the link                        
window.addEventListener( 'click', function ( event ) {
    var item = "";
    if ( event.target.classList.contains( 'popup-link' ) ) {
        item = event.target;
    }
    if ( event.target.parentNode.classList.contains( 'popup-link' ) ) {
        item = event.target.parentNode;
    }
    if ( item ) {
        event.preventDefault();
        showPopup();
    }
}, false );



// Check if window support touch (iPhone), otherwise it's click
// var touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
// Note: If you need to tap the background to close the video, put the empty 'onclick=""' to the main div 'videoLightbox'. This is to fix the bug on iPhone.

// Close the popup screen when users click outside the box or the close button                      
window.addEventListener( 'click', function ( event ) {
    if ( event.target == modal || event.target.classList.contains( 'popup-close' ) ) {
        //console.log(event.target);
        event.preventDefault();
        hidePopup();
    }
}, false );

// Close the popup screen when users use escape key
window.addEventListener('keyup', function( event ) {
    if ( event.keyCode == 27 ) {
        hidePopup();
    }                 
}, false);

})( window, document );