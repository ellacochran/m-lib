# m() JavaScript Library

The m() Javascript library is intended to be a library of commonly used javascript functions that can/must be used in an asynchronous fashion. It is intended to be close to the metal, in contrast to many other JavaScript libraries such as Prototype or jQuery.

The main intent is not to provide means for cool DOM manipulations, but rather a sound underpinning for more complex and intricate JavaScript applications in the browser.

## Modules

Everything in the m() library is structured in district modules. There is only one global JavaScript variable being used (window.m) which is a function both for defining modules as well as for using them.

To define a module you simply call m('module-name', function(exports, module) { [definition] });
The definition looks very much like a module written for nodeJS in that the exports object (truly module.exports) is what defines the module.

The single difference is that there is no require() available. However other modules can be used by calling module('module-name'). As long as the module has already been defined at the time of the call, the other modules exports object will be returned.

To use a module from the top-level is also achieved via the m() function. In case there is no definition passed in, the module's exports object of the module by that name is returned.

<pre>Example:
<code>
m('json').httpGET('/url', function(err, val) {
  if (err) {
    alert('Ooops there was an error: '+err.message);
  } else {<br>
    alert('Got a JSON Object: '+val);
  }
});
</code></pre>

## Licenses
Individual Authors and Licenses are mentioned with the modules below as far as they can currently be determined.
Unless otherwise noted the rest is done by myself and is under the MIT License. Since there is no compilation and/or
linking involved and the source is distibuted on every web-page these are used under, even the terms of the GPL are
being respected.

## Module aes
**License**  
© by an unknown author and released under an OSI License.  
If you are the original author or know who the original author is, please contact Ella Cochran <ellacochran@rocketmail.com>

### function m('aes').encrypt(key, data)
### function m('aes').decrypt(key, data)
### function m('aes').generateKey(keyLength)

## Module array
### function Array.isArray(item)
### function Array.prototype.contains(item)
### function Array.prototype.indexOf(value)
### function Array.prototype.filter(iterator, thisPointer)
### function Array.prototype.map(iterator, thisPointer)
### function Array.prototype.multiMap(iterator, thisPointer)
### function Array.prototype.forEach(iterator, thisPointer)
### function Array.prototype.every(iterator, thisPointer)
### function Array.prototype.some(iterator, thisPointer)

## Module async
**License**  
Copyright @ 2010 Caolan McMahon  
Licensed under the MIT License  
Original to be found at https://github.com/caolan/async  

For documentation please see [https://github.com/caolan/async/blob/master/README.md]()

## Module base64
**License**  
© by an unknown author and released under an OSI License.  
If you are the original author or know who the original author is, please contact Ella Cochran <ellacochran@rocketmail.com>

## Module bytes
**License**  
© by an unknown author and released under an OSI License.  
If you are the original author or know who the original author is, please contact Ella Cochran <ellacochran@rocketmail.com>

### function m('base64').bytesToBase64(bytes)
Converts an array of bytes (integers between 0 and 255) to base64.

### function m('base64').base64ToBytes(base64)
Converts a base64 encoded string to an array of bytes.

## Module cookies
### function m('cookies').all()
Gets an object containing all the currently available cookies

### function m('cookies').get(name)
Gets the value of an individual cookie

### function m('cookies').set(name, value[, path, expires, domain])
Sets a new cookie. 

## Module css
### function m('css').delClass(node, classname)
Removes a class from a specific HTML-Node.

### function m('css').addClass(node, classname)
Adds a class to a specific HTML-Node. Makes sure there is only one instance of the class afterwards.

### function m('css').hasClass(node, classname)
Checks if an HTML-Node has a specific class (returns a boolean).

### function m('css').toggleClass(node, classname)
Deletes the class form the HTML-Node if it is there or adds it if it is not.

### function m('css').replaceClass(node, oldclassname, newclassname)
Exchanges a specific class on an HTML-Node with anotherone. If the oldClass is not on the node this does not do anything.

## Module events
### function m('events')(object, [ systemEventName, … ])

## Module http
### function m('http').XHR()
A constructor for the XMLHttpRequest that works accross browsers.

### function m('http').Request()
A constructor for the XMLHttpRequest that works accross browsers.

### function m('http').httpRequest(method, url, data, callback)
Does an HTTP-Request with a specified method, url and data. When done calls the callback with the responseText.
The this pointer in the callback will be the XMLHttpRequest. The callback is a function(err, val) where err is
the XMLHttpRequest in case an error Status was returned (>299). The value will be the responseText unless an error
Status is returned.

### function m('http').GET(url, callback)
A shortcut for m('http').httpRequest("GET", url, null, callback)

### function m('http').POST(url, data, callback)
A shortcut for m('http').httpRequest("POST", url, data, callback)

### function m('http').PUT(url, data, callback)
A shortcut for m('http').httpRequest("PUT", url, data, callback)

### function m('http').DELETE(url, callback)
A shortcut for m('http').httpRequest("DELETE", url, null, callback)

## Module json
**License**  
Public Domain.  
NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.  
See [http://www.JSON.org/js.html]()  

The functions httpGET, httpPUT and httpPOST are
© 2011 by Ella Cochran <ellacochran@rocketmail.com>  
Licensed under the MIT License  

### function m('json').parse(string[, reviver])
This parses a JSON-String into an object. The optional reviver is used as described at [http://www.json.org]().
The single additional feature is that there is always a date reviver. This revives Strings in the format
"YYYY-MM-DDThh:mm:ss.µµµZ" to a Date object.

### function m('json').stringify(object, replacer, space)
This stringifies an object. See [http://www.json.org]() for a closer description. The only change in behaviour is
that it always stringifies a Date Object into a String of the format "YYYY-MM-DDThh:mm:ss.µµµZ"

### function m('json').httpGET(url, [reviver,] callback)
Gets a JSON Object from a URL using the optional reviver. When the request is done the callback is called.
The callback is a function(err, val) where the *err* is any error that has occurred and the *val* is
the resulting JSON object if available.

### function m('json').httpPUT(url, data, [reviver,] callback)
Puts an object (*data*) via an HTTP PUT request to a url. When complete the callback is called. The callback
is a function(err, val) where *err* is any error that occurred and *val* is any data returned run through JSON.parse.
If parsing failed it is returned as a string instead.

### function m('json').httpPOST(url, data, [reviver,] callback)
Posts an object (*data*) via an HTTP POST request to a url. When complete the callback is called. The callback
is a function(err, val) where *err* is any error that occurred and *val* is any data returned run through JSON.parse.
If parsing failed it is returned as a string instead.

## Module rsa
**License**  
@ 2000 by John M. Hanna  
Licensed under the Gnu Public License.  
Latest version found at [http://sourceforge.net/projects/shop-js]()  
Modifications and GnuPG multi precision integer (mpi) conversion added © 2004 by Herbert Hanewinkel, [http://www.haneWIN.de]()  

### function m('rsa').decrypt(m, d, p, q, u)
### function m('rsa').encrypt(s, e, m)

## Module sha1
**License**  
© Chris Veness 2002-2010 [http://www.movable-type.co.uk]()  
Licensed under the Lesser Gnu Public License  

### function m('sha1')(data)
Returns the hex representation of the SHA1 hash of the string passed in *data*.

## Module sha256
**License**  
© Chris Veness 2002-2010 [http://www.movable-type.co.uk]()  
Licensed under the Lesser Gnu Public License  

### function m('sha256')(data)
Returns the hex representation of the SHA256 hash of the string passed in *data*.

## Module storage
### function m('storage').get(name, callback)
### function m('storage').set(name, value, callback)
### function m('storage').remove(name, callback)

## Module template(s)

## Module utf8
**License**  
© Chris Veness 2002-2010 [http://www.movable-type.co.uk]()  
Licensed under the Lesser Gnu Public License  

### function m('utf8').encode(string)
Returns a utf8 encoded version of the string.

### function m('utf8').decode(string)
Returns a decoded version of the utf8 string passed in.

## Module utilities
### function m('utilities').delay(timeout, function, [arg1, …])
Calls the *function* after a delay of *timeout* milliseconds with the optional arguments passed along.

### function m('utilities').curry(function, [arg1, …])
Curries a *function* so that it is first passed any arguments passed to curry and then any arguments passed to the resulting function.
