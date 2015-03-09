(function (window, document) {
  'use strict';

//  var navigator = window.navigator;
  // Install Service Worker
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/worker.js').then(function (reg) {
      console.log('◕‿◕', reg);
    }, function (err) {
      console.log('ಠ_ಠ', err);
    });
  }

  // Polymer Ready Event
  document.addEventListener('polymer-ready', function () {
    // Perform some behaviour
    // console.log('Polymer is ready to rock!');
    console.log('%cWelcome to Cordova App Killer!\n%cSpéciale dédicace pour Christophe',
      'font-size:1.5em;color:#4558c9;', 'color:#d61a7f;font-size:1em;');
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(window, document);
