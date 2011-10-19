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

