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
