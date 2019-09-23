import "./styles.css";

import {
  default_alphabet,
  default_plaintext,
  seed,
  cipher_size,
  maximus
} from "./common";

import { hex_sha1, hex2binb } from "./sha1";
import { prng } from "./prng";

// Artur Mustafin, (c) 2019, https://codepen.io/hack2root/pen/eYObdXv
// Eli Grey (c) http://purl.eligrey.com/github/FileSaver.js
// LCG Park & Miller (c) 1988,1993, s=>()=>(2**31-1&(s=Math.imul(48271,s)))/2**31

var alphabet = [...default_alphabet];
var plaintext = [...default_plaintext];

var rnd = new prng(seed);
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
const output = document.getElementById("output");
const app1 = document.getElementById("app1");
const app2 = document.getElementById("app2");
const randomize = document.getElementById("randomize");
const alphabet_random = document.getElementById("alphabet_random");
const alphabet_default = document.getElementById("alphabet_default");
const encrypt = document.getElementById("encrypt");
const decrypt = document.getElementById("decrypt");
const clear = document.getElementById("clear");

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

function shuffle_binb(alphabet, str) {
  let array = hex2binb(str);
  shuffle(alphabet, array[0]);
  shuffle(alphabet, array[1]);
  shuffle(alphabet, array[2]);
  shuffle(alphabet, array[3]);
}

function shuffle(array, seed) {
  let rng = new prng(seed);
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(rng.next(i));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function sha1(array) {
  return hex_sha1(array.join(""));
}

function clear_() {
  output.innerText = "";
}

function log(value) {
  output.innerText += value + "\n";
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
  const random = parseInt(IV1.value, 10);
  const _sha_alphabet = sha_alphabet1.value;
  const _sha_plaintext = sha_plaintext1.value;
  const shift = Number(shift1.value);
  const alpha = [...alphabet1.value];
  const text = [...plaintext1.value];
  let array = encrypt_cipher(
    random,
    shift,
    alpha,
    text,
    _sha_alphabet,
    _sha_plaintext
  );
  output1.value = array.join("");
  clear_();
  log(JSON.stringify(frequencyDistribution(plaintext1.value)));
  log(JSON.stringify(frequencyDistribution(output1.value)));
}

function decrypt_() {
  const random = parseInt(IV2.value, 10);
  const _sha_alphabet = sha_alphabet2.value;
  const _sha_plaintext = sha_plaintext2.value;
  const shift = Number(shift2.value);
  const alpha = [...alphabet2.value];
  const text = [...plaintext2.value];
  let array = decrypt_cipher(
    random,
    shift,
    alpha,
    text,
    _sha_alphabet,
    _sha_plaintext
  );
  output2.value = array.join("");
  clear_();
  log(JSON.stringify(frequencyDistribution(plaintext2.value)));
  log(JSON.stringify(frequencyDistribution(output2.value)));
}

function decrypt_cipher(...args) {
  return cipher_function(shift_decrypt)(...args);
}

function encrypt_cipher(...args) {
  return cipher_function(shift_encrypt)(...args);
}

function cipher_function(cipher) {
  return function(random, shift, alpha, array, sha_alphabet, sha_plaintext) {
    alphabet = alpha;
    shuffle_binb(alphabet, sha_alphabet);
    shuffle_binb(alphabet, sha_plaintext);
    rnd = new prng(random);
    for (let i = 0; i < shift; i++) {
      array = array.map(cipher);
    }
    return array;
  };
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

clear.addEventListener("click", event => {
  event.preventDefault();
  clear_();
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
