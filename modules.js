(function() {
  if ('function' !== typeof window.m) {
    var m = window.m = function(name, maker) {
      if (!name) return m.modules;
      if ('function' === typeof maker) {
        m.exports = {};
        maker(m.exports, m);
        m.modules[name] = m.exports;
        m.exports = undefined;
      }
      return m.modules[name];
    };
    m.modules = {};
  }
})();


