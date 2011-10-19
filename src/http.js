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
