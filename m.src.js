/*
SOME THESE LIBRARIES WERE COLLECTED AND ADAPTED OVER THE LAST SEVERAL YEARS FORM VARIOUS OPEN-SOURCE SOURCES. NOT ALL OF THEM CAN BE 
RECOVERED AT THIS TIME. MOST OF THE LIBRARIES HAVE BEEN SUBSTANTIALLY ADAPTED. IF YOU KNOW WHERE THEY CAME FROM, PLEASE CONTACT
ME. I DO FEEL THOUGH THAT THE INTENTION OF THE ORIGINAL AUTHORS WAS ALWAYS TO ALLOW FOR THE ADAPTION AND REDISTRIBUTION OF THESE
PARTS IN AN OPEN MANNER, SO THAT I FEEL COMFORTABLE WITH REDISTRIBUTING THESE ADAPTIONS IN THIS FORM.

The collection as a whole (minus some of the libraries marked in their source files) are

Copyright (c) 2011 Ella Cochran <ellacochran@rocketmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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


/* TOP OF FILE : src/aes.js */
/*
** © by an unknown author and released under an OSI License.
** If you are the original author or know who the original author is,
** please contact Ella Cochran <ellacochran@rocketmail.com>
*/

m('aes', function(exports, module) {
  var SBox = [ 99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22 ];
  var SBox_Inv;
  var ShiftRowTab = [ 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 1, 6, 11 ];
  var ShiftRowTab_Inv;
  var xtime;
  
  var init = exports.init = function() {
    Sbox_Inv = new Array(256);
    for(var i = 0; i < 256; i++) {
      Sbox_Inv[Sbox[i]] = i;
    }
    
    ShiftRowTab_Inv = new Array(16);
    for(var i = 0; i < 16; i++) {
      ShiftRowTab_Inv[ShiftRowTab[i]] = i;
    }
  
    xtime = new Array(256);
    for(var i = 0; i < 128; i++) {
      xtime[i] = i << 1;
      xtime[128 + i] = (i << 1) ^ 0x1b;
    }
  };
  
  var done = exports.done = function() {
    Sbox_Inv = undefined;
    ShiftRowTab_Inv = undefined;
    xtime = undefined;
  };
    
  var expandKey = function(key) {
    var kl = key.length, ks, Rcon = 1;
    switch (kl) {
      case 16: ks = 16 * (10 + 1); break;
      case 24: ks = 16 * (12 + 1); break;
      case 32: ks = 16 * (14 + 1); break;
      default: throw new Error("expandKey: Only key lengths of 16, 24 or 32 bytes allowed!");
    }
    for(var i = kl; i < ks; i += 4) {
      var temp = key.slice(i - 4, i);
      if (i % kl == 0) {
        temp = [ Sbox[temp[1]] ^ Rcon, Sbox[temp[2]], Sbox[temp[3]], Sbox[temp[0]] ];
        if ((Rcon <<= 1) >= 256) Rcon ^= 0x11b;
      } else if ((kl > 24) && (i % kl == 16)) {
        temp = [ Sbox[temp[0]], Sbox[temp[1]], Sbox[temp[2]], Sbox[temp[3]] ];
      }
      for(var j = 0; j < 4; j++) {
        key[i + j] = key[i + j - kl] ^ temp[j];
      }
    }
  };
  
  
  var encryptBlock = function(block, key) {
    var l = key.length;
    addRoundKey(block, key.slice(0, 16));
    for(var i = 16; i < l - 16; i += 16) {
      subBytes(block, Sbox);
      shiftRows(block, ShiftRowTab);
      mixColumns(block);
      addRoundKey(block, key.slice(i, i + 16));
    }
    subBytes(block, Sbox);
    shiftRows(block, ShiftRowTab);
    addRoundKey(block, key.slice(i, l));
  };
  
  var decryptBlock = function(block, key) {
    var l = key.length;
    addRoundKey(block, key.slice(l - 16, l));
    shiftRows(block, ShiftRowTab_Inv);
    subBytes(block, Sbox_Inv);
    for(var i = l - 32; i >= 16; i -= 16) {
      addRoundKey(block, key.slice(i, i + 16));
      mixColumns_Inv(block);
      shiftRows(block, ShiftRowTab_Inv);
      subBytes(block, Sbox_Inv);
    }
    addRoundKey(block, key.slice(0, 16));
  };
  
  var subBytes = function(state, sbox) {
    for(var i = 0; i < 16; i++) {
      state[i] = sbox[state[i]];
    }
  };
  
  var addRoundKey = function (state, rkey) {
    for(var i = 0; i < 16; i++) {
      state[i] ^= rkey[i];
    }
  };
  
  var shiftRows = function(state, shifttab) {
    var h = [].concat(state);
    for(var i = 0; i < 16; i++) {
      state[i] = h[shifttab[i]];
    }
  };
  
  var mixColumns = function(state) {
    for(var i = 0; i < 16; i += 4) {
      var s0 = state[i + 0], s1 = state[i + 1];
      var s2 = state[i + 2], s3 = state[i + 3];
      var h = s0 ^ s1 ^ s2 ^ s3;
      state[i + 0] ^= h ^ xtime[s0 ^ s1];
      state[i + 1] ^= h ^ xtime[s1 ^ s2];
      state[i + 2] ^= h ^ xtime[s2 ^ s3];
      state[i + 3] ^= h ^ xtime[s3 ^ s0];
    }
  };
  
  
  var mixColumns_Inv = function (state) {
    for(var i = 0; i < 16; i += 4) {
      var s0 = state[i + 0], s1 = state[i + 1];
      var s2 = state[i + 2], s3 = state[i + 3];
      var h = s0 ^ s1 ^ s2 ^ s3;
      var xh = xtime[h];
      var h1 = xtime[xtime[xh ^ s0 ^ s2]] ^ h;
      var h2 = xtime[xtime[xh ^ s1 ^ s3]] ^ h;
      state[i + 0] ^= h1 ^ xtime[s0 ^ s1];
      state[i + 1] ^= h2 ^ xtime[s1 ^ s2];
      state[i + 2] ^= h1 ^ xtime[s2 ^ s3];
      state[i + 3] ^= h2 ^ xtime[s3 ^ s0];
    }
  };
  
  exports.encrypt = function(key, data) {
    m('crypto/bytes').toByteArray(data);
    key = key.map(function(item) { return item; });
    expandKey(key);
    if (!xtime || !ShiftRowTab_Inv || !SBox_Inv) init();
    var result = [];
    while (data.length) {
      var block = data.splice(0, 16);
      while (block.length < 16) block.push(0);
      encryptBlock(block, key);
      result = result.concat(block);
    }
    return result;
  };
  exports.decrypt = function(key, data) {
    m('crypto/bytes').toByteArray(data);
    key = key.map(function(item) { return item; });
    expandKey(key);
    if (!xtime || !ShiftRowTab_Inv || !SBox_Inv) init();
    var result = [];
    while (data.length) {
      var block = data.splice(0, 16);
      while (block.length < 16) block.push(0);
      decryptBlock(block, key);
      result = result.concat(block);
    }
    return result;
  };
  exports.generateKey = function(kl) {
    switch (kl) {
      case 16: ks = 16 * (10 + 1); break;
      case 24: ks = 16 * (12 + 1); break;
      case 32: ks = 16 * (14 + 1); break;
      default: throw new Error("generateKey: Only key lengths of 16, 24 or 32 bytes allowed!");
    }
    return m('bytes').randomBytes(kl);
  };
});

/* END OF FILE : src/aes.js */

/* TOP OF FILE : src/array.js */
/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('array', function(exports, module) {
	if ("function" !== typeof Array.isArray) {
		Array.isArray = function(value) {
			return (value)&&((Array === value.constructor)||(Object.prototype.toString.apply(value) === '[object Array]'));
		};
	}
	if ("function" !== typeof Array.prototype.contains) {
		Array.prototype.contains = function(item) {
			for (var idx=0; idx<this.length; idx++) {
				if (this[idx] == item) return true;
			}
			return false;
		};
	}
	if ("function" !== typeof Array.prototype.execEach) {
		Array.prototype.execEach = function(obj, args) {
			for (var idx=0; idx<this.length; idx++) {
				try {
					if ("function" === typeof this[idx]) {
						this[idx].apply(obj || this, args || []);
					}
				} catch(ex) {
					try { Console.log(ex); } catch(ignore) {}
				}
			}
		};
	}
	if ("function" !== typeof Array.prototype.indexOf) {
		Array.prototype.indexOf = function(value) {
			for (var idx=0; idx<this.length; idx++) {
				if (this[idx] == value) return idx;
			}
			return -1;
		};
	}
	if ("function" !== typeof Array.prototype.filter) Array.prototype.filter=function(filter, thisp) {
		var res = [];
		for (var idx=0; idx < this.length; idx++) {
			if (filter.call(thisp || this, this[idx], idx, this)) {
				res.push(this[idx]);
			}
		}
		return res;
	};
	if ("function" !== typeof Array.prototype.map) Array.prototype.map=function(map, thisp) {
		var res = [];
		for (var idx=0; idx < this.length; idx++) {
				res.push(map.call(thisp || this, this[idx], idx, this));
		}
		return res;
	};
	if ("function" !== typeof Array.prototype.multiMap) Array.prototype.multiMap=function(map, thisp) {
		var res = [];
		for (var idx=0; idx < this.length; idx++) {
				res = res.concat(map.call(thisp || this, this[idx], idx, this));
		}
		return res;
	};
	if ("function" !== typeof Array.prototype.forEach) Array.prototype.forEach=function(func, thisp) {
		return this.map(func, thisp).length;
	};
	if ("function" !== typeof Array.prototype.every) Array.prototype.every=function(func, thisp) {
		var res = this.filter(func, thisp);
		return (res.length === this.length);
	};
	if ("function" !== typeof Array.prototype.some) Array.prototype.some=function(func, thisp) {
		for (var idx=0; idx < this.length; idx++) {
			if (func.call(thisp || this, this[idx], idx, this)) return true;
		}
		return false;
	};
});
/* END OF FILE : src/array.js */

/* TOP OF FILE : src/async.js */
/*
** Copyright (c) 2010 Caolan McMahon
** Licensed under the MIT License
** Original to be found at https://github.com/caolan/async
*/

m('async',function (exports, module) {

    var async = module.exports = {};

    // global on the server, window in the browser
    var root = exports;
    var previous_async = root.Async;

   

    async.noConflict = function () {
        root.Async = previous_async;
        return async;
    };

    //// cross-browser compatiblity functions ////

    var _forEach = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _forEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    var _indexOf = function (arr, item) {
        if (arr.indexOf) {
            return arr.indexOf(item);
        }
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        async.nextTick = function (fn) {
            setTimeout(fn, 0);
        };
    }
    else {
        async.nextTick = process.nextTick;
    }

    async.forEach = function (arr, iterator, callback) {
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, function (x) {
            iterator(x, function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                }
            });
        });
    };

    async.forEachSeries = function (arr, iterator, callback) {
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEach].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);


    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.forEachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var completed = [];

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _forEach(listeners, function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (completed.length === keys.length) {
                callback(null);
            }
        });

        _forEach(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                if (err) {
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    completed.push(k);
                    taskComplete();
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && _indexOf(completed, x) !== -1);
                }, true);
            };
            if (ready()) {
                task[task.length - 1](taskCallback);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        if (!tasks.length) {
            return callback();
        }
        callback = callback || function () {};
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.nextTick(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    async.parallel = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEach(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.queue = function (worker, concurrency) {
        var workers = 0;
        var tasks = [];
        var q = {
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                tasks.push({data: data, callback: callback});
                if(q.saturated && tasks.length == concurrency) q.saturated();
                async.nextTick(q.process);
            },
            process: function () {
                if (workers < q.concurrency && tasks.length) {
                    var task = tasks.shift();
                    if(q.empty && tasks.length == 0) q.empty();
                    workers += 1;
                    worker(task.data, function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if(q.drain && tasks.length + workers == 0) q.drain();
                        q.process();
                    });
                }
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _forEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        hasher = hasher || function (x) {
            return x;
        };
        return function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else {
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    callback.apply(null, arguments);
                }]));
            }
        };
    };

});
/* END OF FILE : src/async.js */

/* TOP OF FILE : src/base64.js */
/*
** © by an unknown author and released under an OSI License.
** If you are the original author or know who the original author is,
** please contact Ella Cochran <ellacochran@rocketmail.com>
*/

m('base64', function(exports, module){
  var base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	
	// Convert a byte array to a base-64 string
	exports.bytesToBase64 = function (bytes) {

		// Use browser-native function if it exists
		if (typeof btoa == "function") return btoa(module('bytes').Binary.bytesToString(bytes));

		for(var base64 = [], i = 0; i < bytes.length; i += 3) {
			var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
			for (var j = 0; j < 4; j++) {
				if (i * 8 + j * 6 <= bytes.length * 8)
					base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
				else base64.push("=");
			}
		}

		return base64.join("");
	};

	// Convert a base-64 string to a byte array
	exports.base64ToBytes = function (base64) {

		// Use browser-native function if it exists
		if (typeof atob == "function") return module('bytes').Binary.stringToBytes(atob(base64));

		// Remove non-base-64 characters
		base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");

		for (var bytes = [], i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
			if (imod4 == 0) continue;
			bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2)) |
			           (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
		}

		return bytes;
	};

});
/* END OF FILE : src/base64.js */

/* TOP OF FILE : src/bytes.js */
/*
** © by an unknown author and released under an OSI License.
** If you are the original author or know who the original author is,
** please contact Ella Cochran <ellacochran@rocketmail.com>
*/

m('bytes', function(exports, module) {
  // UTF-8 encoding
  var UTF8 = exports.UTF8 = {};
  UTF8.stringToBytes= function (str) {
    return Binary.stringToBytes(unescape(encodeURIComponent(str)));
  };
  // Convert a byte array to a string
  UTF8.bytesToString= function (bytes) {
    return decodeURIComponent(escape(Binary.bytesToString(bytes)));
  };
  
  // Binary encoding
  var Binary = exports.Binary = {};
  
    // Convert a string to a byte array
  Binary.stringToBytes= function (str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xFF);
    return bytes;
  };
  
  // Convert a byte array to a string
  Binary.bytesToString= function (bytes) {
    var str = [];
    for (var i = 0; (i < bytes.length) && bytes[i]; i++) str.push(String.fromCharCode(bytes[i]));
    return str.join("");
  };
  
  exports.stringToBytes = UTF8.stringToBytes;
  exports.bytesToString = UTF8.bytesToString;
  
  exports.isByteArray = function(data) {
    if ((!data) || ('object' != typeof data)) return false;
    if (data.constructor !== Array) return false;
    var res = data.filter(function(item) {
      if (isNaN(item)) return true;
      if ((item < 0) || (item > 255)) return true;
      return false;
    });
    return !res.length;
  };
  exports.toByteArray = function(data) {
    if (typeof data ==  'object') {
      if (exports.isByteArray(data)) return data;
      return UTF8.stringToBytes(m('json').stringify(data));
    } else {
      return UTF8.stringToBytes(String(data));
    };
  };
  
  // Bit-wise rotate left
  exports.rotl= function (n, b) {
    return (n << b) | (n >>> (32 - b));
  };

  // Bit-wise rotate right
  exports.rotr= function (n, b) {
    return (n << (32 - b)) | (n >>> b);
  };

  // Swap big-endian to little-endian and vice versa
  exports.endian= function (n) {
    // If number given, swap endian
    if (n.constructor == Number) {
      return util.rotl(n,  8) & 0x00FF00FF |
            util.rotl(n, 24) & 0xFF00FF00;
    }

    // Else, assume array and swap all items
    for (var i = 0; i < n.length; i++)
      n[i] = util.endian(n[i]);
    return n;
  };

  // Generate an array of any length of random bytes
  exports.randomBytes= function (n) {
    for (var bytes = []; n > 0; n--)
      bytes.push(Math.floor(Math.random() * 256));
    return bytes;
  };

  // Convert a byte array to big-endian 32-bit words
  exports.bytesToWords= function (bytes) {
    for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
      words[b >>> 5] |= bytes[i] << (24 - b % 32);
    return words;
  };

  // Convert big-endian 32-bit words to a byte array
  exports.wordsToBytes= function (words) {
    for (var bytes = [], b = 0; b < words.length * 32; b += 8)
      bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
    return bytes;
  };

  // Convert a byte array to a hex string
  exports.bytesToHex= function (bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
      hex.push((bytes[i] >>> 4).toString(16));
      hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
  };

  // Convert a hex string to a byte array
  exports.hexToBytes= function (hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
  };
  
  exports.numToHex = function(n) {
    var s="", v;
    for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
    return s;
  };
  
  
});
/* END OF FILE : src/bytes.js */

/* TOP OF FILE : src/cookies.js */
/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('cookies', function(exports, module) {
  var cache = undefined;
	var Cookies = module.exports = {};
	Cookies.all = function() {
	  if (cache) return cache;
		var res = {};
		var str = String(document.cookie || "").split(/;\s+/);
		for (var idx=0; idx<str.length; idx++) {
			str[idx] = str[idx].split(/\s*=\s*/,2);
			res[str[idx][0]] = str[idx][1];
		};
		return cache = res;
	};
	Cookies.set = function(name, value, path, expires, domain) {
		path = ("; path="+(path||"/"));
		expires = (expires.constructor === Date)?("; expires="+expires.toGMTString()):"";
		domain = domain?("; domain="+domain):"";
		document.cookie = [ (name+"="+value), path, expires, domain ].join("");
		cache = undefined;
	};
	Cookies.get = function(name) {
		return Cookies.all()[name];
	};
});

/* END OF FILE : src/cookies.js */

/* TOP OF FILE : src/css.js */
/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('css', function(exports, module) {
	var CSS = module.exports = {};

	CSS.delClass = function(node, classname) {
	  if (Array.isArray(classname)) {
	    classname.forEach(function(classname) {
	      CSS.delClass(node, classname);
	    });
	    return;
	  }
		var cn = node.className+"";
		var re = new RegExp("^"+classname+"\\s+|\\s+"+classname+"$|\\s+"+classname+"\\s+|^"+classname+"$");
		node.className=cn.replace(re,'').replace(/^\s+|\s+$/,'');
		return node;
	};
	CSS.addClass = function(node, classname) {
		CSS.delClass(node, classname);
		if (Array.isArray(classname)) {
	    classname.join(" ");
	  }
		node.className = (node.className+" "+classname).replace(/^\s+|\s+$/,'');
		return node;
	};
	CSS.hasClass = function(node, classname) {
		var cn = node.className+"";
		var re = new RegExp("^"+classname+"\\s+|\\s+"+classname+"$|\\s+"+classname+"\\s+|^"+classname+"$");
		return cn.match(re)?true:false;
	};
	CSS.toggleClass = function(node, classname) {
		if(CSS.hasClass(node, classname)) {
			CSS.delClass(node, classname);
		} else {
			CSS.addClass(node, classname);
		}
		return node;
	};
  CSS.replaceClass = function(node, delclass, addclass) {
    CSS.delClass(node, delclass);
    CSS.addClass(node, addclass);
  };
});
/* END OF FILE : src/css.js */

/* TOP OF FILE : src/events.js */
/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

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
/* END OF FILE : src/events.js */

/* TOP OF FILE : src/http.js */
/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('http', function(exports, module) {
	var msid = ["Microsoft.XMLHTTP", "MSXML2.ServerXMLHTTP", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP"];
	var HTTPRequest = window.XMLHttpRequest || function() {
		var req=null;
		while (!req && msid.length) {
      try { req = new ActiveXObject(msid[0]); } catch (e) { req = null; }
      if (!req) msid.shift();
    }
		return req;
	};
	
	exports.XHR = HTTPRequest;
	exports.Request = HTTPRequest;
	exports.httpRequest = function(method, url, data, callback) {
		var request = new HTTPRequest();
		request.onreadystatechange = function() {
			if (request.readyState !== 4) return;
			if ('function' === typeof callback) {
				callback.call(request, (request.status > 299)?request:undefined, request.responseText);
			}		
		};
		request.open(method, url, true);
		request.send(data || null);
	};
	exports.GET = function(url, callback) {
		return exports.httpRequest('GET', url, null, callback);
	};
	exports.POST = function(url, data, callback) {
		return exports.httpRequest('POST', url, data, callback);
	};
	exports.PUT = function(url, data, callback) {
		return exports.httpRequest('PUT', url, data, callback);
	};
	exports.DELETE = function(url, callback) {
		return exports.httpRequest('DELETE', url, null, callback);
	};
});
/* END OF FILE : src/http.js */

/* TOP OF FILE : src/json.js */
/*
** Public Domain.
** NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
** See http://www.JSON.org/js.html
*/

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
/* END OF FILE : src/json.js */

/* TOP OF FILE : src/rsa.js */
/* RSA public key encryption/decryption
 * The following functions are (c) 2000 by John M Hanna and are
 * released under the terms of the Gnu Public License.
 * You must freely redistribute them with their source -- see the
 * GPL for details.
 *  -- Latest version found at http://sourceforge.net/projects/shop-js
 *
 * Modifications and GnuPG multi precision integer (mpi) conversion added
 * 2004 by Herbert Hanewinkel, www.haneWIN.de
 */
 
m('rsa',function(exports) {
  // --- Arbitrary Precision Math ---
  // badd(a,b), bsub(a,b), bsqr(a), bmul(a,b)
  // bdiv(a,b), bmod(a,b), bexpmod(g,e,m), bmodexp(g,e,m)
  
  // bs is the shift, bm is the mask
  // set single precision bits to 28
  var bs=28;
  var bx2=1<<bs, bm=bx2-1, bx=bx2>>1, bd=bs>>1, bdm=(1<<bd)-1;
  
  var log2=Math.log(2);
  
  function zeros(n) {
   var r=[];
   while(n-->0) r.push(0);
   return r;
  }
  
  function zclip(r) {
   var n = r.length;
   if(r[n-1]) return r;
   while(n>1 && r[n-1]==0) n--;
   return r.slice(0,n);
  }
  
  // returns bit length of integer x
  function nbits(x) {
    var n = 1, t;
    if((t=x>>>16) != 0) { x = t; n += 16; }
    if((t=x>>8) != 0) { x = t; n += 8; }
    if((t=x>>4) != 0) { x = t; n += 4; }
    if((t=x>>2) != 0) { x = t; n += 2; }
    if((t=x>>1) != 0) { x = t; n += 1; }
    return n;
  }
  
  function badd(a,b) {
   var al=a.length;
   var bl=b.length;
  
   if(al < bl) return badd(b,a);
  
   var r=new Array(al);
   var c=0, n=0;
  
   for(; n<bl; n++) {
    c+=a[n]+b[n];
    r[n]=c & bm;
    c>>>=bs;
   }
   for(; n<al; n++) {
    c+=a[n];
    r[n]=c & bm;
    c>>>=bs;
   }
   if(c) r[n]=c;
   return r;
  }
  
  function bsub(a,b) {
   var al=a.length;
   var bl=b.length;
  
   if(bl > al) return [];
   if(bl == al) {
    if(b[bl-1] > a[bl-1]) return [];
    if(bl==1) return [a[0]-b[0]];
   }
  
   var r=new Array(al);
   var c=0;
  
   for(var n=0; n<bl; n++) {
    c+=a[n]-b[n];
    r[n]=c & bm;
    c>>=bs;
   }
   for(;n<al; n++) {
    c+=a[n];
    r[n]=c & bm;
    c>>=bs;
   }
   if(c) return [];
  
   return zclip(r);
  }
  
  function ip(w, n, x, y, c) {
   var xl = x&bdm;
   var xh = x>>bd;
  
   var yl = y&bdm;
   var yh = y>>bd;
  
   var m = xh*yl+yh*xl;
   var l = xl*yl+((m&bdm)<<bd)+w[n]+c;
   w[n] = l&bm;
   c = xh*yh+(m>>bd)+(l>>bs);
   return c;
  }
  
  // Multiple-precision squaring, HAC Algorithm 14.16
  
  function bsqr(x) {
   var t = x.length;
   var n = 2*t;
   var r = zeros(n);
   var c = 0;
   var i, j;
  
   for(i = 0; i < t; i++)
   {
    c = ip(r,2*i,x[i],x[i],0);
    for(j = i+1; j < t; j++)
    {
     c = ip(r,i+j,2*x[j],x[i],c);
    }
    r[i+t] = c;
   }
  
   return zclip(r);
  }
  
  // Multiple-precision multiplication, HAC Algorithm 14.12
  
  function bmul(x,y) {
   var n = x.length;
   var t = y.length;
   var r = zeros(n+t-1);
   var c, i, j;
  
   for(i = 0; i < t; i++)
   {
    c = 0;
    for(j = 0; j < n; j++)
    {
     c = ip(r,i+j,x[j],y[i],c);
    }
    r[i+n] = c;
   }
  
   return zclip(r);
  }
  
  function toppart(x,start,len) {
   var n=0;
   while(start >= 0 && len-->0) n=n*bx2+x[start--];
   return n;
  }
  
  // Multiple-precision division, HAC Algorithm 14.20
  
  function bdiv(a,b) {
   var n=a.length-1;
   var t=b.length-1;
   var nmt=n-t;
  
   // trivial cases; a < b
   if(n < t || n==t && (a[n]<b[n] || n>0 && a[n]==b[n] && a[n-1]<b[n-1]))
   {
    this.q=[0]; this.mod=a;
    return this;
   }
  
   // trivial cases; q < 4
   if(n==t && toppart(a,t,2)/toppart(b,t,2) <4)
   {
    var x=a.concat();
    var qq=0;
    var xx;
    for(;;)
    {
     xx=bsub(x,b);
     if(xx.length==0) break;
     x=xx; qq++;
    }
    this.q=[qq]; this.mod=x;
    return this;
   }
  
   // normalize
   var shift2=Math.floor(Math.log(b[t])/log2)+1;
   var shift=bs-shift2;
  
   var x=a.concat();
   var y=b.concat();
  
   if(shift)
   {
    for(i=t; i>0; i--) y[i]=((y[i]<<shift) & bm) | (y[i-1] >> shift2);
    y[0]=(y[0]<<shift) & bm;
    if(x[n] & ((bm <<shift2) & bm))
    {
     x[++n]=0; nmt++;
    }
    for(i=n; i>0; i--) x[i]=((x[i]<<shift) & bm) | (x[i-1] >> shift2);
    x[0]=(x[0]<<shift) & bm;
   }
  
   var i, j, x2;
   var q=zeros(nmt+1);
   var y2=zeros(nmt).concat(y);
   for(;;)
   {
    x2=bsub(x,y2);
    if(x2.length==0) break;
    q[nmt]++;
    x=x2;
   }
  
   var yt=y[t], top=toppart(y,t,2)
   for(i=n; i>t; i--)
   {
    var m=i-t-1;
    if(i >= x.length) q[m]=1;
    else if(x[i] == yt) q[m]=bm;
    else q[m]=Math.floor(toppart(x,i,2)/yt);
  
    var topx=toppart(x,i,3);
    while(q[m] * top > topx) q[m]--;
  
    //x-=q[m]*y*b^m
    y2=y2.slice(1);
    x2=bsub(x,bmul([q[m]],y2));
    if(x2.length==0)
    {
     q[m]--;
     x2=bsub(x,bmul([q[m]],y2));
    }
    x=x2;
   }
   // de-normalize
   if(shift)
   {
    for(i=0; i<x.length-1; i++) x[i]=(x[i]>>shift) | ((x[i+1] << shift2) & bm);
    x[x.length-1]>>=shift;
   }
  
   this.q = zclip(q);
   this.mod = zclip(x);
   return this;
  }
  
  // returns the mod where m < 2^bd 
  function simplemod(i,m) {
   var c=0, v;
   for(var n=i.length-1; n>=0; n--) {
    v=i[n];
    c=((v >> bd) + (c<<bd)) % m;
    c=((v & bdm) + (c<<bd)) % m;
   }
   return c;
  }
  
  function bmod(p,m) {
   if(m.length==1) {
    if(p.length==1) return [p[0] % m[0]];
    if(m[0] < bdm) return [simplemod(p,m[0])];
   }
  
   var r=bdiv(p,m);
   return r.mod;
  }
  
  // Barrett's modular reduction, HAC Algorithm 14.42
  
  function bmod2(x,m,mu) {
   var xl=x.length - (m.length << 1);
   if(xl > 0) return bmod2(x.slice(0,xl).concat(bmod2(x.slice(xl),m,mu)),m,mu);
  
   var ml1=m.length+1, ml2=m.length-1,rr;
   //var q1=x.slice(ml2)
   //var q2=bmul(q1,mu)
   var q3=bmul(x.slice(ml2),mu).slice(ml1);
   var r1=x.slice(0,ml1);
   var r2=bmul(q3,m).slice(0,ml1);
   var r=bsub(r1,r2);
   
   if(r.length==0) {
    r1[ml1]=1;
    r=bsub(r1,r2);
   }
   for(var n=0;;n++) {
    rr=bsub(r,m);
    if(rr.length==0) break;
    r=rr;
    if(n>=3) return bmod2(r,m,mu);
   }
   return r;
  }
  
  // Modular exponentiation, HAC Algorithm 14.79
  
  function bexpmod(g,e,m) {
   var a = g.concat();
   var l = e.length-1;
   var n = nbits(e[l])-2;
  
   for(; l >= 0; l--) {
    for(; n >= 0; n-=1) {
     a=bmod(bsqr(a),m);
     if(e[l] & (1<<n)) a=bmod(bmul(a,g),m);
    }
    n = bs-1;
   }
   return a;
  }
  
  // Modular exponentiation using Barrett reduction
  
  function bmodexp(g,e,m) {
   var a=g.concat();
   var l=e.length-1;
   var n=m.length*2;
   var mu=zeros(n+1);
   mu[n]=1;
   mu=bdiv(mu,m).q;
  
   n = nbits(e[l])-2;
  
   for(; l >= 0; l--) {
    for(; n >= 0; n-=1) {
     a=bmod2(bsqr(a),m, mu);
     if(e[l] & (1<<n)) a=bmod2(bmul(a,g),m, mu);
    }
    n = bs-1;
   }
   return a;
  }
  
  // -----------------------------------------------------
  // Compute s**e mod m for RSA public key operation
  
  function RSAencrypt(s, e, m) { return bexpmod(s,e,m); }
  
  // Compute m**d mod p*q for RSA private key operations.
  
  function RSAdecrypt(m, d, p, q, u) {
   var xp = bmodexp(bmod(m,p), bmod(d,bsub(p,[1])), p);
   var xq = bmodexp(bmod(m,q), bmod(d,bsub(q,[1])), q);
  
   var t=bsub(xq,xp);
   if(t.length==0) {
    t=bsub(xp,xq);
    t=bmod(bmul(t, u), q);
    t=bsub(q,t);
   } else {
    t=bmod(bmul(t, u), q);
   } 
   return badd(bmul(t,p), xp);
  }
  
  // -----------------------------------------------------------------
  // conversion functions: num array <-> multi precision integer (mpi)
  // mpi: 2 octets with length in bits + octets in big endian order
  
  function mpi2b(s) {
   var bn=1, r=[0], rn=0, sb=256;
   var c, sn=s.length;
   if(sn < 2) {
      throw new Error('string too short, not a MPI');
      return 0;
   }
  
   var len=(sn-2)*8;
   var bits=s.charCodeAt(0)*256+s.charCodeAt(1);
   if(bits > len || bits < len-8) {
      throw new Error('not a MPI, bits='+bits+",len="+len);
      return 0;
   }
  
   for(var n=0; n<len; n++) {
    if((sb<<=1) > 255) {
     sb=1; c=s.charCodeAt(--sn);
    }
    if(bn > bm) {
     bn=1;
     r[++rn]=0;
    }
    if(c & sb) r[rn]|=bn;
    bn<<=1;
   }
   return r;
  }
  
  function b2mpi(b) {
   var bn=1, bc=0, r=[0], rb=1, rn=0;
   var bits=b.length*bs;
   var n, rr='';
  
   for(n=0; n<bits; n++) {
    if(b[bc] & bn) r[rn]|=rb;
    if((rb<<=1) > 255) {
     rb=1; r[++rn]=0;
    }
    if((bn<<=1) > bm) {
     bn=1; bc++;
    }
   }
  
   while(rn && r[rn]==0) rn--;
  
   bn=256;
   for(bits=8; bits>0; bits--) if(r[rn] & (bn>>=1)) break;
   bits+=rn*8;
  
   rr+=String.fromCharCode(bits/256)+String.fromCharCode(bits%256);
   if(bits) for(n=rn; n>=0; n--) rr+=String.fromCharCode(r[n]);
   return rr;
  }
  
  exports.encrypt = RSAencrypt;
  exports.decrypt = RSAdecrypt;
});
/* END OF FILE : src/rsa.js */

/* TOP OF FILE : src/sha1.js */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  SHA-1 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk      */
/*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
/*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
/*  Licensed under LGPL                                                                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

m('sha1', function(exports, module) {
  var Sha1 = {};  // Sha1 namespace
  
  /**
   * Generates SHA-1 hash of string
   *
   * @param {String} msg                String to be hashed
   * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
   * @returns {String}                  Hash of msg as hex character string
   */
  Sha1.hash = function(msg, utf8encode) {
    utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
    
    // convert string to UTF-8, as SHA only deals with byte-streams
    if (utf8encode) msg = module('utf8').encode(msg);
    
    // constants [§4.2.1]
    var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
    
    // PREPROCESSING 
    
    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]
    
    // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
    var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
    var N = Math.ceil(l/16);   // number of 16-integer-blocks moduled to hold 'l' ints
    var M = new Array(N);
    
    for (var i=0; i<N; i++) {
      M[i] = new Array(16);
      for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
        M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
          (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
      } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;
    
    // set initial hash value [§5.3.1]
    var H0 = 0x67452301;
    var H1 = 0xefcdab89;
    var H2 = 0x98badcfe;
    var H3 = 0x10325476;
    var H4 = 0xc3d2e1f0;
    
    // HASH COMPUTATION [§6.1.2]
    
    var W = new Array(80); var a, b, c, d, e;
    for (var i=0; i<N; i++) {
    
      // 1 - prepare message schedule 'W'
      for (var t=0;  t<16; t++) W[t] = M[i][t];
      for (var t=16; t<80; t++) W[t] = module('bytes').rotl(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);
      
      // 2 - initialise five working variables a, b, c, d, e with previous hash value
      a = H0; b = H1; c = H2; d = H3; e = H4;
      
      // 3 - main loop
      for (var t=0; t<80; t++) {
        var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
        var T = (module('bytes').rotl(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
        e = d;
        d = c;
        c = module('bytes').rotl(b, 30);
        b = a;
        a = T;
      }
      
      // 4 - compute the new intermediate hash value
      H0 = (H0+a) & 0xffffffff;  // note 'addition modulo 2^32'
      H1 = (H1+b) & 0xffffffff; 
      H2 = (H2+c) & 0xffffffff; 
      H3 = (H3+d) & 0xffffffff; 
      H4 = (H4+e) & 0xffffffff;
    }
  
    return module('bytes').numToHex(H0) + module('bytes').numToHex(H1) + 
      module('bytes').numToHex(H2) + module('bytes').numToHex(H3) + module('bytes').numToHex(H4);
  }
  
  //
  // function 'f' [§4.1.1]
  //
  Sha1.f = function(s, x, y, z)  {
    switch (s) {
    case 0: return (x & y) ^ (~x & z);           // Ch()
    case 1: return x ^ y ^ z;                    // Parity()
    case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
    case 3: return x ^ y ^ z;                    // Parity()
    }
  };
  
  
  module.exports = Sha1.hash;
});
/* END OF FILE : src/sha1.js */

/* TOP OF FILE : src/sha256.js */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  SHA-256 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk    */
/*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
/*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
/*  Licensed under LGPL                                                                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

m('sha256', function(exports, module) {  
  var Sha256 = {};  // Sha256 namespace
  
  /**
   * Generates SHA-256 hash of string
   *
   * @param {String} msg                String to be hashed
   * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
   * @returns {String}                  Hash of msg as hex character string
   */
  Sha256.hash = function(msg, utf8encode) {
      utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
      
      // convert string to UTF-8, as SHA only deals with byte-streams
      if (utf8encode) msg = module('utf8').encode(msg);
      
      // constants [§4.2.2]
      var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
               0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
               0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
               0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
               0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
               0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
               0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
               0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
      // initial hash value [§5.3.1]
      var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  
      // PREPROCESSING 
   
      msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]
  
      // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
      var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ‘1’ + appended length
      var N = Math.ceil(l/16);   // number of 16-integer-blocks moduled to hold 'l' ints
      var M = new Array(N);
  
      for (var i=0; i<N; i++) {
          M[i] = new Array(16);
          for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
              M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                        (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
          } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
      }
      // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
      // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
      // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
      M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
      M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;
  
  
      // HASH COMPUTATION [§6.1.2]
  
      var W = new Array(64); var a, b, c, d, e, f, g, h;
      for (var i=0; i<N; i++) {
  
          // 1 - prepare message schedule 'W'
          for (var t=0;  t<16; t++) W[t] = M[i][t];
          for (var t=16; t<64; t++) W[t] = (Sha256.sigma1(W[t-2]) + W[t-7] + Sha256.sigma0(W[t-15]) + W[t-16]) & 0xffffffff;
  
          // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
          a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];
  
          // 3 - main loop (note 'addition modulo 2^32')
          for (var t=0; t<64; t++) {
              var T1 = h + Sha256.Sigma1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
              var T2 = Sha256.Sigma0(a) + Sha256.Maj(a, b, c);
              h = g;
              g = f;
              f = e;
              e = (d + T1) & 0xffffffff;
              d = c;
              c = b;
              b = a;
              a = (T1 + T2) & 0xffffffff;
          }
           // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
          H[0] = (H[0]+a) & 0xffffffff;
          H[1] = (H[1]+b) & 0xffffffff; 
          H[2] = (H[2]+c) & 0xffffffff; 
          H[3] = (H[3]+d) & 0xffffffff; 
          H[4] = (H[4]+e) & 0xffffffff;
          H[5] = (H[5]+f) & 0xffffffff;
          H[6] = (H[6]+g) & 0xffffffff; 
          H[7] = (H[7]+h) & 0xffffffff; 
      }
  
      return module('bytes').numToHex(H[0]) + module('bytes').numToHex(H[1]) + module('bytes').numToHex(H[2]) + module('bytes').numToHex(H[3]) + 
             module('bytes').numToHex(H[4]) + module('bytes').numToHex(H[5]) + module('bytes').numToHex(H[6]) + module('bytes').numToHex(H[7]);
  }
  
  Sha256.Sigma0 = function(x) { return module('bytes').rotr(2,  x) ^ module('bytes').rotr(13, x) ^ module('bytes').rotr(22, x); }
  Sha256.Sigma1 = function(x) { return module('bytes').rotr(6,  x) ^ module('bytes').rotr(11, x) ^ module('bytes').rotr(25, x); }
  Sha256.sigma0 = function(x) { return module('bytes').rotr(7,  x) ^ module('bytes').rotr(18, x) ^ (x>>>3);  }
  Sha256.sigma1 = function(x) { return module('bytes').rotr(17, x) ^ module('bytes').rotr(19, x) ^ (x>>>10); }
  Sha256.Ch = function(x, y, z)  { return (x & y) ^ (~x & z); }
  Sha256.Maj = function(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
  
  
});/* END OF FILE : src/sha256.js */

/* TOP OF FILE : src/storage.js */
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
/* END OF FILE : src/storage.js */

/* TOP OF FILE : src/template.js */
/*
** © 2011 by Ella Cochran <ellacochran@rocketmail.com>
** Licensed under the MIT License
*/

m('template', function(exports, module) {
	var Template = module.exports = function(tpltxt) {
		this.tpltxt = tpltxt;
	};
	Template.load = function(url, callback) {
		module('http').GET(url, function(err, val) {
			if (err || !val) {
				if ('function' === typeof callback) callback(err);
				return;
			}
			if ('function' === typeof callback) callback(undefined, new Template(val));
		});
	};
	Template.appendChildren = function(parent, nodes) {
		nodes.forEach(function(child) {
			parent.appendChild(child);
		});
	};
	Template.cutChildren = function(node) {
		var res = [];
		while(node.firstChild) res.push(node.removeChild(node.firstChild));
	  return res;
	};
	Template.prototype.render = function(data, callback) {
	  var node = document.createElement('div');
	  node.style.display = 'none';
	  document.body.appendChild(node);
	  if ('string' == typeof this.tpltxt) {
			node.innerHTML = this.tpltxt;
		} else if ('object' == typeof this.tpltxt) {
			var kids = this.tpltxt.cloneNode(true);
			while (kids.firstChild) node.appendChild(kids.removeChild(kids.firstChild));
		}
		callback = callback || function(){};
		this.renderNode(node, data, function(err, val) {
			if (err) return callback(err);
			var res = Template.cutChildren(node)
			if (node.parentNode) node.parentNode.removeChild(node);
			callback(undefined, res);
		});
	};
	Template.prototype.executeAttribute = function(template, node, data, attribute) {
		var render = node.getAttribute(attribute);
		if (!render) return true;
		try {
			var render = new Function('template', 'node', 'data', 'template', render);
			return render(template, node, data, this);
		} catch(err) {
			return false;
		}
	};
	Template.prototype.renderNode = function(node, data, callback) {
		var that = this;
		var children = [];
		var idx = 0;
		for (idx=0; idx < node.attributes.length; idx++) children.push(node.attributes[idx]);
		for (idx=0; idx < node.childNodes.length; idx++) children.push(node.childNodes[idx]);
		children = children.map(function(node) {
			switch(node.nodeType) {
				case 1: return function(callback) {
					if (!that.executeAttribute(this, node, data, 'onprerender')) {
						if (node.parentNode) node.parentNode.removeChild(node);
						return callback(undefined);
					}
					window.setTimeout(function() {
						that.renderNode(node, data, function(err, val) {
							if (err) return callback(err);
							if (!that.executeAttribute(that, node, data, 'onrender')) {
								if (node.parentNode) node.parentNode.removeChild(node);
								return callback(undefined);
							}
							callback(undefined);
						});
					}, 0);
				}
				case 2:
				case 3: return function(callback) {
					window.setTimeout(function() {
						that.renderText(node, data, callback);
					}, 0);
				}
			}
		});
		module('async').parallel(children, function(errs, vals) {
			if (errs) {
				errs = errs.filter(function(item) { return item?true:false; });
				if (errs.length) return callback(errs);
			}
			callback(undefined, node);
		});
	};
	Template.prototype.renderText = function(node, data, callback) {
		if (!node.nodeValue) return callback(undefined);
		var text = ([ 'src', 'href' ].indexOf(node.nodeName) != -1) ? decodeURI(node.nodeValue) : node.nodeValue;
		if (!text.match(/\$\{/)) return callback(undefined);
		var deferred = false;
		var errors = [];
		var parts = text.split("${");
		for (var idx=1; (idx<parts.length); idx++) {
			var last = -1;
			var sq=false; var dq=false; var pc=0;
			for (var cnt=0; cnt<parts[idx].length && (pc >= 0); cnt++) {
				var c = parts[idx].charAt(cnt);
				if (sq) {
					if (c=="\\") {
						cnt++;
					} else if (c=="'") {
						sq=false;
					}
				} else if (dq) {
					if (c=="\\") {
						cnt++;
					} else if (c=='"') {
						dq = false;
					}
				} else {
					if (c=="'") {
						sq = true;
					} else if (c=='"') {
						dq = true;
					} else if (c=='{') {
						pc++;
					} else if (c=='}') {
						pc--;
					}
				}
				last = (c=='}')?cnt:-1;
			}
			if (last>=0) {
				var code = parts[idx].substring(0,last);
				var stuff = parts[idx].substring(last+1);
				var result="";
				try {
					var func = new Function("node", "data", "template", "defer", code);
					result = func.call(node, node, data, this, function() { 
						if (deferred) return undefined;
						deferred=true;
						var oldcallback = callback;
						callback=function(){};
						return oldcallback;
					});
					if (!result) result="";
				} catch(ex) {
					errors.push(ex);
				}
				parts[idx] = result+stuff;
			}
		}
		node.nodeValue = parts.join('');
		return callback(errors.length?errors:undefined, node.nodeValue);
	};
	Template.prototype.renderInto = function(data, parent, template, callback) {
		if (('function'===typeof template) && (!callback)) {
			callback = template;
			template = undefined;
		}
		switch (typeof template) {
			case 'object' : break;
			case 'string' : if (!this.parent) break; template = this.parent.get(template); break;
			default : template = this;
		}
		template = template || this;
		template.render(data, function(err, val) {
			if (err || !val) return callback(err, val);
			val.forEach(function(item) {
				parent.appendChild(item);
			});
			callback(err, val);
		});
	};
});

m('templates', function(exports, module) {
  var Template = module('template');
	var Templates = module.exports = function(templates) {
		this.templates = templates;
	};
	Templates.load = function(url, callback) {
		module('http').GET(url, function(err, val) {
			if (err || !val) {
				if ('function' === typeof callback) callback(err);
				return;
			}
			var res = [];
			var parent = new Templates(res);
			var node = document.createElement('div');
			node.innerHTML = val;
			while (node.firstChild) {
				var kid = node.removeChild(node.firstChild);
				if (kid.nodeType === 1) {
					var kidt = new Template(kid);
					kidt.name = kid.getAttribute('name');
					kidt.parent = parent;
				  res.push(kidt);
				}
			}
			if ('function' === typeof callback) callback(undefined, parent);
		});
	};
	Templates.prototype.render = function(data, callback) {
		callback = callback || function(){};
		var main = this.get('main');
		if (!main) return callback(new Error('No Template "main"'));
		main.render(data, callback);
	};
	Templates.prototype.get = function(name) {
		return this.templates.filter(function(tpl) { return (tpl.name === name); }).shift();
	};
	Templates.prototype.renderInto = function(data, parent, callback) {
		this.render(data, function(err, val) {
			if (err || !val) return callback(err, val);
			val.forEach(function(item) {
				parent.appendChild(item);
			});
			callback(err, val);
		});
	};
});
/* END OF FILE : src/template.js */

/* TOP OF FILE : src/utf8.js */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2010                         */
/*  Licensed under LGPL                                                                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

m('utf8', function(exports, module) {
  var Utf8 = module.exports = {};  // Utf8 namespace
  
  /**
   * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
   * (BMP / basic multilingual plane only)
   *
   * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
   *
   * @param {String} strUni Unicode string to be encoded as UTF-8
   * @returns {String} encoded string
   */
  Utf8.encode = function(strUni) {
    // use regular expressions & String.replace callback function for better efficiency 
    // than procedural approaches
    var strUtf = strUni.replace(
        /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
        function(c) { 
          var cc = c.charCodeAt(0);
          return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
      );
    strUtf = strUtf.replace(
        /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
        function(c) { 
          var cc = c.charCodeAt(0); 
          return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
      );
    return strUtf;
  };
  
  /**
   * Decode utf-8 encoded string back into multi-byte Unicode characters
   *
   * @param {String} strUtf UTF-8 string to be decoded back to Unicode
   * @returns {String} decoded string
   */
  Utf8.decode = function(strUtf) {
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    var strUni = strUtf.replace(
        /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
        function(c) {  // (note parentheses for precence)
          var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
          return String.fromCharCode(cc); }
      );
    strUni = strUni.replace(
        /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
        function(c) {  // (note parentheses for precence)
          var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
          return String.fromCharCode(cc); }
      );
    return strUni;
  };
  
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */  
});
/* END OF FILE : src/utf8.js */

/* TOP OF FILE : src/utilities.js */
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
/* END OF FILE : src/utilities.js */

