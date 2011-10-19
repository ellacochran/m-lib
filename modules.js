/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

(function() {
  if ('function' !== typeof window.m) {
    var modules = {};
    var m = window.m = function(name, maker) {
      if (!name) return m.modules;
      if ('function' === typeof maker) {
        maker.m = m;
        modules[name] = maker;
        return;
      }
      if (modules[name] && (modules[name].m == m)) {
        m.exports = {};
        modules[name](m.exports, m);
        modules[name] = m.exports;
        m.exports = undefined;
      }
      return m.modules[name];
    };
    m.modules = {};
  }
})();


