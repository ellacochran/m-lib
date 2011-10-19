/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('utils', function(exports, module) {
  exports.delay = function() {
    var delay = arguments[0];
    var routine = arguments[1];
    if (isNaN(delay) || ('function' !== typeof routine)) throw new Error('Illegal Arguments');
    var args = [];
    for (var idx=2; idx < arguments.length; idx++) args.push(arguments[idx]);
    return window.setTimeout(function() { routine.apply(window, args); }, delay);
  };
  
  exports.curry = function(routine) {
    if ('function' !== typeof routine) throw new Error('Illegal Arguments');
    m('array');
    var that = (this == exports) ? window : this;
    var args = [];
    for (var idx=1; idx<arguments.length; idx++) args.push(arguments[idx]);
    return function() {
      var callargs = args.map(function(arg) { return arg; });
      for (var idx=0; idx<arguments.length; idx++) callargs.push(arguments[idx]);
      return routine.apply(that, callargs);
    };
  };
});
