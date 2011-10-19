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
    m('array');
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
    m('array');
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

