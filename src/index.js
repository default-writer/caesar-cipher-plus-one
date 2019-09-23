import "./styles.css";

// Artur Mustafin, (c) 2019, https://codepen.io/hack2root/pen/eYObdXv
// Eli Grey (c) http://purl.eligrey.com/github/FileSaver.js
// LCG Park & Miller (c) 1988,1993, s=>()=>(2**31-1&(s=Math.imul(48271,s)))/2**31

const default_alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  " ",
  ":",
  ",",
  "*",
  "~",
  "!",
  "@",
  "#",
  "%",
  "^",
  "-",
  "=",
  '"',
  "?",
  ".",
  "_",
  "+",
  "(",
  ")",
  "[",
  "]",
  "|",
  "{",
  "}",
  "'",
  "\n"
];

const default_plaintext = `The atmosphere of Mars is about 100 times thinner than Earth's, and it is 95 percent carbon dioxide. Here's a breakdown of its composition, according to a NASA fact sheet:

Carbon dioxide: 95.32 percent
Nitrogen: 2.7 percent
Argon: 1.6 percent
Oxygen: 0.13 percent
Carbon monoxide: 0.08 percent
Also, minor amounts of: water, nitrogen oxide, neon, hydrogen-deuterium-oxygen, krypton and xenon.`;

var alphabet = [...default_alphabet];
var plaintext = [...default_plaintext];

const seed = 1238473661;
const cipher_size = alphabet.length;
const maximus = 2147483647 >> 2;

const PRNG = function(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) {
    this._seed += 2147483646;
  }
};

PRNG.prototype.next = function(a, b) {
  this._seed = (this._seed * 48271) % 2147483647;
  if (arguments.length === 0) {
    return this._seed / 2147483647;
  } else if (arguments.length === 1) {
    return (this._seed / 2147483647) * a;
  } else {
    return (this._seed / 2147483647) * (b - a) + a;
  }
};

var rnd = new PRNG(seed);
var random = 0;

const alphabet1 = document.getElementById("alphabet1");
const plaintext1 = document.getElementById("plaintext1");
const alphabet2 = document.getElementById("alphabet2");
const plaintext2 = document.getElementById("plaintext2");
const IV1 = document.getElementById("IV1");
const IV2 = document.getElementById("IV2");
const output1 = document.getElementById("output1");
const output2 = document.getElementById("output2");
const import_json = document.getElementById("import_json");
const export_json = document.getElementById("export_json");
const upload_json = document.getElementById("upload_json");
const export_public_json = document.getElementById("export_public_json");
const sha_plaintext1 = document.getElementById("sha_plaintext1");
const sha_plaintext2 = document.getElementById("sha_plaintext2");
const sha_alphabet1 = document.getElementById("sha_alphabet1");
const sha_alphabet2 = document.getElementById("sha_alphabet2");
const shift1 = document.getElementById("shift1");
const shift2 = document.getElementById("shift2");
const test_output = document.getElementById("test_output");
const app1 = document.getElementById("app1");
const app2 = document.getElementById("app2");
const randomize = document.getElementById("randomize");
const alphabet_random = document.getElementById("alphabet_random");
const alphabet_default = document.getElementById("alphabet_default");
const encrypt = document.getElementById("encrypt");
const decrypt = document.getElementById("decrypt");

function shuffle_binb(alphabet, str) {
  let array = hex2binb(str);
  shuffle(alphabet, array[0]);
  shuffle(alphabet, array[1]);
  shuffle(alphabet, array[2]);
  shuffle(alphabet, array[3]);
}

function shuffle(array, seed) {
  let rng = new PRNG(seed);
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(rng.next(i));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function sha1(array) {
  return hex_sha1(array.join(""));
}

alphabet1.value = alphabet.join("");
plaintext1.value = plaintext.join("");
sha_alphabet1.readOnly = true;
sha_plaintext1.readOnly = true;
IV1.value = 1;
shift1.value = 1;
IV2.value = "";
shift2.value = "";
sha_alphabet1.value = sha1(alphabet);
sha_plaintext1.value = sha1(plaintext);

encrypt_();

function clear() {
  test_output.innerText = "";
}

function log(value) {
  test_output.innerText += value + "\n";
}

function clear2_() {
  alphabet2.value = "";
  plaintext2.value = "";
  sha_alphabet2.value = "";
  sha_plaintext2.value = "";
  output2.value = "";
  shift2.value = "";
  IV2.value = "";
}

function encrypt_() {
  random = parseInt(IV1.value, 10);
  alphabet = [...alphabet1.value];
  shuffle_binb(alphabet, sha_alphabet1.value);
  shuffle_binb(alphabet, sha_plaintext1.value);
  const shift = Number(shift1.value);
  let array = [...plaintext1.value];
  rnd = new PRNG(random);
  for (let i = 0; i < shift; i++) {
    array = array.map(shift_encrypt);
  }
  output1.value = array.join("");
  clear();
  log(JSON.stringify(frequencyDistribution(plaintext1.value)));
  log(JSON.stringify(frequencyDistribution(output1.value)));
}

function decrypt_() {
  random = parseInt(IV2.value, 10);
  alphabet = [...alphabet2.value];
  shuffle_binb(alphabet, sha_alphabet2.value);
  shuffle_binb(alphabet, sha_plaintext2.value);
  const shift = Number(shift2.value);
  let array = [...plaintext2.value];
  rnd = new PRNG(random);
  for (let i = 0; i < shift; i++) {
    array = array.map(shift_decrypt);
  }
  output2.value = array.join("");
}

function placeFileContent(file) {
  readFileContent(file)
    .then(content => {
      clear2_();
      plaintext2.value = content.cipher;
      sha_plaintext2.value = content.sha;
      alphabet2.value = content.key
        ? [...content.key].join("")
        : [...default_alphabet].join("");
      sha_alphabet2.value = content.key
        ? sha1([...content.key])
        : sha1([...default_alphabet]);
      shift2.value = content.shift ? parseInt(content.shift, 10) : 1;
      IV2.value = content.iv ? parseInt(content.iv, 10) : 1;
      decrypt_();
    })
    .catch(error => console.log(error));
}

function readFileContent(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(JSON.parse(event.target.result));
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

test.addEventListener("click", event => {
  event.preventDefault();
  clear();
  log(sha1_vm_test());
  let hex1 = sha1(alphabet);
  let binb = hex2binb(hex1);
  let hex2 = binb2hex(binb);
  log(hex1 === hex2);
});

upload_json.addEventListener("change", event => {
  event.preventDefault();
  if (upload_json.files.length === 1) {
    placeFileContent(upload_json.files[0]);
  }
});

upload_json.addEventListener("click", event => {
  event.preventDefault();
  document.getElementById("upload_json").value = "";
});

import_json.addEventListener("click", event => {
  event.preventDefault();
  click(upload_json);
});

export_json.addEventListener("click", event => {
  event.preventDefault();
  const blob = new Blob(
    [
      JSON.stringify({
        cipher: output1.value,
        sha: sha_plaintext1.value,
        key: alphabet1.value,
        shift: shift1.value,
        iv: IV1.value
      })
    ],
    { type: "application/json;charset=utf-8" }
  );
  saveAs(blob, "settings.json");
});

export_public_json.addEventListener("click", event => {
  event.preventDefault();
  const blob = new Blob(
    [
      JSON.stringify({
        cipher: output1.value,
        sha: sha_plaintext1.value
      })
    ],
    { type: "application/json;charset=utf-8" }
  );
  saveAs(blob, "settings-public.json");
});

app1.addEventListener("click", event => {
  event.preventDefault();
  IV2.value = IV1.value;
  shift2.value = shift1.value;
  alphabet2.value = alphabet1.value;
  plaintext2.value = output1.value;
  sha_alphabet2.value = sha_alphabet1.value;
  sha_plaintext2.value = sha_plaintext1.value;
  output2.value = "";
});

app2.addEventListener("click", event => {
  event.preventDefault();
  IV1.value = IV2.value;
  shift1.value = shift2.value;
  alphabet1.value = alphabet2.value;
  plaintext1.value = output2.value;
  sha_alphabet1.value = sha_alphabet2.value;
  sha_plaintext1.value = sha_plaintext2.value;
  output1.value = "";
});

IV1.addEventListener("input", event => {
  event.preventDefault();
  encrypt_();
});

alphabet1.addEventListener("input", event => {
  event.preventDefault();
  sha_alphabet1.value = sha1(alphabet);
  encrypt_();
});

plaintext1.addEventListener("input", event => {
  event.preventDefault();
  plaintext = [...plaintext1.value];
  sha_plaintext1.value = sha1(plaintext);
  encrypt_();
});

randomize.addEventListener("click", event => {
  event.preventDefault();
  random = Math.floor(rnd.next(0, maximus));
  IV1.value = random;
  encrypt_();
});

alphabet_random.addEventListener("click", event => {
  event.preventDefault();
  random = Math.floor(rnd.next(0, maximus));
  shuffle(alphabet, random);
  alphabet1.value = alphabet.join("");
  sha_alphabet1.value = sha1(alphabet);
  encrypt_();
});

alphabet_default.addEventListener("click", event => {
  event.preventDefault();
  alphabet = [...default_alphabet];
  plaintext = [...default_plaintext];
  shift1.value = 1;
  IV1.value = 1;
  shift2.value = "";
  IV2.value = "";
  alphabet1.value = alphabet.join("");
  plaintext1.value = plaintext.join("");
  alphabet2.value = "";
  plaintext2.value = "";
  output2.value = "";
  sha_alphabet1.value = sha1(alphabet);
  sha_plaintext1.value = sha1(plaintext);
  sha_alphabet2.value = "";
  sha_plaintext2.value = "";
  encrypt_();
});

shift1.addEventListener("change", event => {
  event.preventDefault();
  encrypt_();
});

encrypt.addEventListener("click", event => {
  event.preventDefault();
  encrypt_();
});

decrypt.addEventListener("click", event => {
  event.preventDefault();
  decrypt_();
});

function shift_encrypt(char, shift, array) {
  const position = alphabet.indexOf(char);
  let j = Math.floor(rnd.next(maximus));
  let newPosition = (position + 1 + j) % cipher_size;
  while (newPosition === position) {
    j = Math.floor(rnd.next(maximus));
    newPosition = (position + 1 + j) % cipher_size;
  }
  if (char === undefined || !alphabet.includes(char)) throw Error("undefined");
  return _encrypt(char, j);
}

function shift_decrypt(char, shift, array) {
  const position = alphabet.indexOf(char);
  let j = Math.floor(rnd.next(maximus));
  let newPosition =
    cipher_size - 1 - ((cipher_size - position + j) % cipher_size);
  while (newPosition === position) {
    j = Math.floor(rnd.next(maximus));
    newPosition =
      cipher_size - 1 - ((cipher_size - position + j) % cipher_size);
  }
  if (char === undefined || !alphabet.includes(char)) throw Error("undefined");
  return _decrypt(char, j);
}

function _encrypt(char, j) {
  return alphabet[(alphabet.indexOf(char) + 1 + j) % cipher_size];
}

function _decrypt(char, j) {
  return alphabet[
    cipher_size - 1 - ((cipher_size - alphabet.indexOf(char) + j) % cipher_size)
  ];
}

function convertKeysToItems(obj) {
  return Object.keys(obj).map(function(key) {
    return [key, obj[key]];
  });
}

function sortByNumThenLetter(array) {
  return array.sort(function(a, b) {
    var firstLetter = a[0],
      firstNum = a[1],
      secondLetter = b[0],
      secondNum = b[1];
    if (firstNum < secondNum) {
      return 1;
    }
    if (firstNum > secondNum) {
      return -1;
    }
    if (firstLetter > secondLetter) {
      return 1;
    }
    if (firstLetter < secondLetter) {
      return -1;
    }
    return 0;
  });
}

function frequencyDistribution(text) {
  const freq = letterFrequency(text);
  const items = convertKeysToItems(freq);
  const sort_items = sortByNumThenLetter(items);
  return {
    chars: sort_items.reduce((acc, curr) => (acc += curr[0]), ""),
    values: sort_items.map(s => s[1])
  };
}

function letterFrequency(text) {
  var count = {};
  text.split("").map(s => (count[s] = count[s] ? count[s] + 1 : 1));
  return Object.keys(count)
    .sort()
    .reduce((acc, curr) => ({ ...acc, [curr]: count[curr] }), {});
}

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s) {
  return binb2hex(core_sha1(str2binb(s), s.length * chrsz));
}
function b64_sha1(s) {
  return binb2b64(core_sha1(str2binb(s), s.length * chrsz));
}
function str_sha1(s) {
  return binb2str(core_sha1(str2binb(s), s.length * chrsz));
}
function hex_hmac_sha1(key, data) {
  return binb2hex(core_hmac_sha1(key, data));
}
function b64_hmac_sha1(key, data) {
  return binb2b64(core_hmac_sha1(key, data));
}
function str_hmac_sha1(key, data) {
  return binb2str(core_hmac_sha1(key, data));
}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test() {
  return hex_sha1("abc") === "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - (len % 32));
  x[(((len + 64) >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;
  var e = -1009589776;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for (var j = 0; j < 80; j++) {
      if (j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
      var t = safe_add(
        safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
        safe_add(safe_add(e, w[j]), sha1_kt(j))
      );
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return [a, b, c, d, e];
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d) {
  if (t < 20) return (b & c) | (~b & d);
  if (t < 40) return b ^ c ^ d;
  if (t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t) {
  return t < 20
    ? 1518500249
    : t < 40
    ? 1859775393
    : t < 60
    ? -1894007588
    : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data) {
  var bkey = str2binb(key);
  if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16),
    opad = Array(16);
  for (var i = 0; i < 16; i++) {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5c5c5c5c;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y) {
  var lsw = (x & 0xffff) + (y & 0xffff);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str) {
  var bin = [];
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i >> 5] |=
      (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - (i % 32));
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin) {
  var str = "";
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode(
      (bin[i >> 5] >>> (32 - chrsz - (i % 32))) & mask
    );
  return str;
}

/*
 * Convert a hex string to an array of big-endian words.
 */
function hex2binb(str) {
  let result = [];
  while (str.length >= 8) {
    result.push(parseInt(str.substring(0, 8), 16));
    str = str.substring(8, str.length);
  }
  return result;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i++) {
    str +=
      hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8 + 4)) & 0xf) +
      hex_tab.charAt((binarray[i >> 2] >> ((3 - (i % 4)) * 8)) & 0xf);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i += 3) {
    var triplet =
      (((binarray[i >> 2] >> (8 * (3 - (i % 4)))) & 0xff) << 16) |
      (((binarray[(i + 1) >> 2] >> (8 * (3 - ((i + 1) % 4)))) & 0xff) << 8) |
      ((binarray[(i + 2) >> 2] >> (8 * (3 - ((i + 2) % 4)))) & 0xff);
    for (var j = 0; j < 4; j++) {
      if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> (6 * (3 - j))) & 0x3f);
    }
  }
  return str;
}

// The one and only way of getting global scope in all environments
// https://stackoverflow.com/q/3277182/1008999
var _global =
  typeof window === "object" && window.window === window
    ? window
    : typeof window.self === "object" && window.self.self === window.self
    ? window.self
    : typeof global === "object" && global.global === global
    ? global
    : this;

function bom(blob, opts) {
  if (typeof opts === "undefined") opts = { autoBom: false };
  else if (typeof opts !== "object") {
    console.warn("Deprecated: Expected third argument to be a object");
    opts = { autoBom: !opts };
  }

  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  if (
    opts.autoBom &&
    /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(
      blob.type
    )
  ) {
    return new Blob([String.fromCharCode(0xfeff), blob], { type: blob.type });
  }
  return blob;
}

function download(url, name, opts) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.onload = function() {
    saveAs(xhr.response, name, opts);
  };
  xhr.onerror = function() {
    console.error("could not download file");
  };
  xhr.send();
}

function corsEnabled(url) {
  var xhr = new XMLHttpRequest();
  // use sync to avoid popup blocker
  xhr.open("HEAD", url, false);
  try {
    xhr.send();
  } catch (e) {}
  return xhr.status >= 200 && xhr.status <= 299;
}

// `a.click()` doesn't work for all browsers (#465)
function click(node) {
  try {
    node.dispatchEvent(new MouseEvent("click"));
  } catch (e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
      "click",
      true,
      true,
      window,
      0,
      0,
      0,
      80,
      20,
      false,
      false,
      false,
      false,
      0,
      null
    );
    node.dispatchEvent(evt);
  }
}

var saveAs =
  _global.saveAs ||
  // probably in some web worker
  (typeof window !== "object" || window !== _global
    ? function saveAs() {
        /* noop */
      }
    : // Use download attribute first if possible (#193 Lumia mobile)
    "download" in HTMLAnchorElement.prototype
    ? function saveAs(blob, name, opts) {
        var URL = _global.URL || _global.webkitURL;
        var a = document.createElement("a");
        name = name || blob.name || "download";

        a.download = name;
        a.rel = "noopener"; // tabnabbing

        // TODO: detect chrome extensions & packaged apps
        // a.target = '_blank'

        if (typeof blob === "string") {
          // Support regular links
          a.href = blob;
          if (a.origin !== window.location.origin) {
            corsEnabled(a.href)
              ? download(blob, name, opts)
              : click(a, (a.target = "_blank"));
          } else {
            click(a);
          }
        } else {
          // Support blobs
          a.href = URL.createObjectURL(blob);
          setTimeout(function() {
            URL.revokeObjectURL(a.href);
          }, 4e4); // 40s
          setTimeout(function() {
            click(a);
          }, 0);
        }
      }
    : // Use msSaveOrOpenBlob as a second approach
    "msSaveOrOpenBlob" in navigator
    ? function saveAs(blob, name, opts) {
        name = name || blob.name || "download";

        if (typeof blob === "string") {
          if (corsEnabled(blob)) {
            download(blob, name, opts);
          } else {
            var a = document.createElement("a");
            a.href = blob;
            a.target = "_blank";
            setTimeout(function() {
              click(a);
            });
          }
        } else {
          navigator.msSaveOrOpenBlob(bom(blob, opts), name);
        }
      }
    : // Fallback to using FileReader and a popup
      function saveAs(blob, name, opts, popup) {
        // Open a popup immediately do go around popup blocker
        // Mostly only available on user interaction and the fileReader is async so...
        popup = popup || window.open("", "_blank");
        if (popup) {
          popup.document.title = popup.document.body.innerText =
            "downloading...";
        }

        if (typeof blob === "string") return download(blob, name, opts);

        var force = blob.type === "application/octet-stream";
        var isSafari =
          /constructor/i.test(_global.HTMLElement) || _global.safari;
        var isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

        if (
          (isChromeIOS || (force && isSafari)) &&
          typeof FileReader !== "undefined"
        ) {
          // Safari doesn't allow downloading of blob URLs
          var reader = new FileReader();
          reader.onloadend = function() {
            var url = reader.result;
            url = isChromeIOS
              ? url
              : url.replace(/^data:[^;]*;/, "data:attachment/file;");
            if (popup) popup.location.href = url;
            else window.location = url;
            popup = null; // reverse-tabnabbing #460
          };
          reader.readAsDataURL(blob);
        } else {
          var URL = _global.URL || _global.webkitURL;
          var url = URL.createObjectURL(blob);
          if (popup) popup.location = url;
          else window.location.href = url;
          popup = null; // reverse-tabnabbing #460
          setTimeout(function() {
            URL.revokeObjectURL(url);
          }, 4e4); // 40s
        }
      });

_global.saveAs = saveAs.saveAs = saveAs;
