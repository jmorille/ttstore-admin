// https://www.npmjs.com/package/hkp-client
var hkp = require('hkp-client');

//var email = 'jmorille@gmail.com';
var email = 'vdupain@gmail.com';


var keyserver = 'http://pgp.mit.edu:11371';
var search = email;
hkp.search(keyserver, search, function(err, results) {
  if (err) return console.log(err);
  console.log(results);
});

var keyId = "E4B4D7E5350667E12B11B7BA38642DD6F77130E4";
hkp.fetch(keyserver, keyId, function(err, pubKey) {
  if (err) return console.log(err);
  console.log(pubKey);
});


