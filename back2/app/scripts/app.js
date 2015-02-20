(function (document) {
  'use strict';

  document.addEventListener('polymer-ready', function () {
    // Perform some behaviour
   // console.log('Polymer is ready to rock!');
    console.log("%cWelcome to Cordova App Killer!\n%cSpéciale dédicace pour Christophe",
      "font-size:1.5em;color:#4558c9;", "color:#d61a7f;font-size:1em;");
  });

// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
})(wrap(document));
