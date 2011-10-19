/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('storage', function(exports, module) {
  var GET = window.localStorage ? (function (name, callback) {
    try {
      var res = module('json').parse(window.localStorage.getItem(name));
      return ('function' == typeof callback) ? callback(res?undefined: new Error('Not Found'), res) : (new Error('Illegal Arguments'));
    } catch(err) {
      callback(err);
    }
  }) : (function (name, callback) {
    if (!window.localStorage) module('cookies').set(Storage.STORAGE_API_COOKIE, module('cookies').Cookies.get(Storage.STORAGE_API_COOKIE) || [ (new Date()).getTime(), Math.random() * 100000000 ].join('-'));
    module('json').httpGET([Storage.STORAGE_API_URL, encodeURIComponent(name)].join('/'), callback);
  });
  
  var PUT = window.localStorage ? (function (name, value, callback) {
    try {
      window.localStorage.setItem(name, module('json').stringify(value));
      return ('function' == typeof callback) ? callback(undefined) : undefined;
    } catch(err) {
      return ('function' == typeof callback) ? callback(err) : undefined;
    }
  }) : (function (name, callback) {
    if (!window.localStorage) module('cookies').set(Storage.STORAGE_API_COOKIE, module('cookies').get(Storage.STORAGE_API_COOKIE) || [ (new Date()).getTime(), Math.random() * 100000000 ].join('-'));
    module('json').httpPUT([Storage.STORAGE_API_URL, encodeURIComponent(name)].join('/'), value, callback);
  });
  
  var DEL = window.localStorage ? (function (name, callback) {
    try {
      window.localStorage.removeItem(name);
      return ('function' == typeof callback) ? callback(undefined) : undefined;
    } catch(err) {
      return ('function' == typeof callback) ? callback(err) : undefined;
    }
  }) : (function (name, callback) {
    if (!window.localStorage) module('cookies').set(Storage.STORAGE_API_COOKIE, module('cookies').get(Storage.STORAGE_API_COOKIE) || [ (new Date()).getTime(), Math.random() * 100000000 ].join('-'));
    module('http').DELETE([Storage.STORAGE_API_URL, encodeURIComponent(name)].join('/'), callback);
  });

  var Storage = module.exports = { "get":GET, "put":PUT, "remove":DEL, STORAGE_API_URL:'/api/v1/storage', STORAGE_API_COOKIE:'storage' };
  
});
