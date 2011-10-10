# m() JavaScript Library

The m() Javascript library is intended to be a library of commonly used javascript functions that can/must be used in an asynchronous fashion. It is intended to be close to the metal, in contrast to many other JavaScript libraries such as Prototype or jQuery.

The main intent is not to provide means for cool DOM manipulations, but rather a sound underpinning for more complex and intricate JavaScript applications in the browser.

## Modules

Everything in the m() library is structured in district modules. There is only one global JavaScript variable being used (window.m) which is a function both for defining modules as well as for using them.

To define a module you simply call m('module-name', function(exports, module) { [definition] });
The definition looks very much like a module written for nodeJS in that the exports object (truly module.exports) is what defines the module.

The single difference is that there is no require() available. However other modules can be used by calling module('module-name'). As long as the module has already been defined at the time of the call, the other modules exports object will be returned.

To use a module from the top-level is also achieved via the m() function. In case there is no definition passed in, the module's exports object of the module by that name is returned.

> Example:<br>
> m('json').httpGET('/url', function(err, val) {<br>
>   if (err) {<br>
>     alert('Ooops there was an error: '+err.message);<br>
>   } else {<br>
>     alert('Got a JSON Object: '+val);<br>
>   }<br>
> });<br>

## Module aes
## Module array
## Module async
## Module base64
## Module bytes
## Module cookies
## Module css
## Module events
## Module http
## Module json
## Module rsa
## Module sha1
## Module sha256
## Module storage
## Module template(s)
## Module utf8
## Module utilities
