m('events',function(exports, module) {
	var Emitter = module.exports = function(obj, evts) {
		obj = obj || this;
		if (('function' != typeof obj.on) || ('function' != typeof obj.once) || ('function' != typeof obj.emit) || ('function' != typeof obj.killEvt) || ('function' != typeof obj.sysEvt)) {
      var events = {};
      var once = {};
      obj.on = function(evtname, handler) {
        events[evtname] = events[evtname] || [];
        events[evtname].push(handler);
      };
      obj.once = function(evtname, handler) {
        once[evtname] = once[evtname] || [];
        once[evtname].push(handler);
      };
      obj.killEvt = function(evtname, handler) {
        events[evtname] = events[evtname] || [];
        events[evtname] = events[evtname].filter(function(item) { return (item!=handler); });
        once[evtname] = once[evtname] || [];
        once[evtname] = once[evtname].filter(function(item) { return (item!=handler); });
      };
      obj.emit = function(evtname) {
        var args = [];
        for (var idx=1; idx<arguments.length; idx++) args.push(arguments[idx]);
        var these = once[evtname] || [];
        once[evtname] = undefined;
        for (idx=0; idx<these.length; idx++) {
          try {
            (function(handler, owner, args) {
              window.setTimeout(function() {
                handler.apply(owner, args);
              }, 0);
            })(these[idx], obj, args);
          } catch (ex) {}
        }
        events[evtname] = events[evtname] || [];
        these = events[evtname]
        for (idx=0; idx<these.length; idx++) {
          try {
            (function(handler, owner, args) {
              window.setTimeout(function() {
                handler.apply(owner, args);
              }, 0);
            })(these[idx], obj, args);
          } catch (ex) {}
        }
      };
      var system = {};
      obj.sysEvt = function(evtname) {
        if (arguments.length > 1) {
          for (var idx=0; idx < arguments.length; idx++) obj.sysEvt(arguments[idx]);
          return obj;
        }
        evtname=String(evtname);
        if (system[evtname]) return system[evtname];
        if (obj.addEventListener) {
          obj.addEventListener(evtname, function(evt) { 
            evt = evt || window.event || {};
            obj.emit(evtname, evt); 
            if ((evt.cancelBubble=obj.noBubbles?true:false) && ('function' == typeof evt.stopPropagation())) evt.stopPropagation();
            return obj.noBubbles?false:true; 
          },false);
          system[evtname] = 'ms';
          return obj;
        }
        if (window.attachEvent) {
          obj.attachEvent('on'+evtname, function(evt) { 
            evt = evt || window.event || {};
            window.emit(evtname, evt);
            if ((evt.cancelBubble=obj.noBubbles?true:false) && ('function' == typeof evt.stopPropagation())) evt.stopPropagation();
            return obj.noBubbles?false:true; 
          });
          system[evtname] = 'w3c';
          return obj;
        }
        obj['on'+evtname] = function(evt) {
          evt = evt || window.event || {};
          window.emit(evtname, evt);
          if ((evt.cancelBubble=obj.noBubbles?true:false) && ('function' == typeof evt.stopPropagation())) evt.stopPropagation();
          return obj.noBubbles?false:true;
        };
        system[evtname] = 'function';
        return obj;
      };
		}
    for (var idx=1; idx < arguments.length; idx++) obj.sysEvt(arguments[idx]);
    return obj;
	};
	
	Emitter(window, 'load');
	Emitter(document);
	
	window.on('load', function() {
		document.emit('load');
	});
	window.on('click', function() {
		document.emit('click');
	});
	window.on('doubleclick', function() {
		document.emit('doubleclick');
	});
});
