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
