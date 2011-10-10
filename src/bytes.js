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
