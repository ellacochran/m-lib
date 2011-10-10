m('json', function(exports, module) {
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	  var gap;
		var indent;
		var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
		var rep;

		var quote = function(string) {
			escapable.lastIndex = 0;
      return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    };
		var str =function(key, holder) {
        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        	case 'string': return quote(value.valueOf());
					case 'number': return isFinite(value) ? String(value.valueOf()) : 'null';
					case 'boolean': return String(value.valueOf());
        	case 'null': return "null";
					case 'object':
						if (!value) {
                return 'null';
            }
						gap += indent;
            partial = [];
						if (Array.isArray(value)) {
							length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
						if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
							for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
						v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
				return undefined;
    };

		var stringify = (window.JSON && ('function' === typeof window.JSON.stringify)) ? window.JSON.stringify : function(value, replacer, space) {
			var i;
			gap = '';
			indent = '';

			if (typeof space === 'number') {
          for (i = 0; i < space; i += 1) {
              indent += ' ';
          }
      } else if (typeof space === 'string') {
          indent = space;
      }
			rep = replacer;
      if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
          throw new Error('JSON.stringify: replacer must be function or array');
      }
			return str('', {'': value});
		};

		var dateReviver = function(reviver) {
			return function(key, value) {
				if ("string" === typeof value) {
					var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{1,2}(?:\.\d*)?)Z$/.exec(value);
					if (a) {
						return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
					}
				}
				return ("function" === typeof reviver) ? reviver.call(this, key, value) : value;
			};
		};

		var parse = (window.JSON && ('function' === typeof window.JSON.parse)) ? 
      function(data, reviver) {
        reviver = dateReviver(reviver);
        return window.JSON.parse(data, reviver);
      } : 
      function(text, reviver) {
        reviver = dateReviver(reviver);
        var j;
        var walk = function(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
              for (k in value) {
                  if (Object.hasOwnProperty.call(value, k)) {
                      v = walk(value, k);
                      if (v !== undefined) {
                          value[k] = v;
                      } else {
                          delete value[k];
                      }
                  }
              }
          }
          return ("function" === typeof reviver)?reviver.call(holder, key, value):value;
        };
  
        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
            text = text.replace(cx, function (a) {
                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }
  
        if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          j = eval('(' + text + ')');
          return walk({'': j}, '');
        }
        throw new SyntaxError('JSON.parse');
      };
		
		var JSON = module.exports = {};
		JSON.parse = parse;
		JSON.stringify = stringify;
		
		JSON.httpGET = function(url, callback) {
			module('http').GET(url, function(err, val) {
				if (err || !val) {
					if ('function' === typeof callback) callback.call(this, err);
					return;
				}
				try {
					if ('function' === typeof callback) callback.call(this, undefined, JSON.parse(val));
					return;
				} catch(err) {
					if ('function' === typeof callback) callback.call(this, err);
					return;
				}
			});
		};
		JSON.httpPUT = function(url, data ,callback) {
			try {
				data = JSON.stringify(data);
			} catch(err) {
				if ('function' === typeof callback) callback.call(this, err);
			}
			module('http').PUT(url, data ,function(err, val) {
				if (err || !val) {
					if ('function' === typeof callback) callback.call(this, err);
					return;
				}
				try {
					if ('function' === typeof callback) callback.call(this, undefined, JSON.parse(val));
					return;
				} catch(err) {
					if ('function' === typeof callback) callback.call(this, err);
					return;
				}
			});
		};	
});
