import "./styles.css";

import {
  sha1,
  encrypt_cipher,
  decrypt_cipher,
  random,
  alphabet,
  plaintext,
  set_plaintext,
  random_key,
  default_key
} from "./cipher";
import { default_alphabet } from "./common";
import { read, saveAs, click } from "./io";
import { chars } from "./chars";

// Artur Mustafin, (c) 2019, https://codepen.io/hack2root/pen/eYObdXv
// Eli Grey (c) http://purl.eligrey.com/github/FileSaver.js
// LCG Park & Miller (c) 1988,1993, s=>()=>(2**31-1&(s=Math.imul(48271,s)))/2**31

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

function distribution_() {
  clear_();
  log(JSON.stringify(chars(plaintext1.value)));
  log(JSON.stringify(chars(output1.value)));
}

function encrypt_() {
  output1.value = encrypt_cipher(
    parseInt(IV1.value, 10),
    Number(shift1.value),
    [...alphabet1.value],
    [...plaintext1.value],
    sha_alphabet1.value,
    sha_plaintext1.value
  ).join("");
  distribution_();
}

function decrypt_() {
  output2.value = decrypt_cipher(
    parseInt(IV2.value, 10),
    Number(shift2.value),
    [...alphabet2.value],
    [...plaintext2.value],
    sha_alphabet2.value,
    sha_plaintext2.value
  ).join("");
  distribution_();
}

function placeFileContent(file) {
  read(file)
    .then(content => {
      clear2_();
      const json = JSON.parse(content);
      plaintext2.value = json.cipher;
      sha_plaintext2.value = json.sha;
      alphabet2.value = json.key
        ? [...json.key].join("")
        : [...default_alphabet].join("");
      sha_alphabet2.value = json.key
        ? sha1([...json.key])
        : sha1([...default_alphabet]);
      shift2.value = json.shift ? parseInt(json.shift, 10) : 1;
      IV2.value = json.iv ? parseInt(json.iv, 10) : 1;
      decrypt_();
    })
    .catch(error => console.log(error));
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
  set_plaintext(plaintext1.value);
  sha_plaintext1.value = sha1(plaintext);
  encrypt_();
});

randomize.addEventListener("click", event => {
  event.preventDefault();
  IV1.value = random();
  encrypt_();
});

alphabet_random.addEventListener("click", event => {
  event.preventDefault();
  random_key();
  alphabet1.value = alphabet.join("");
  sha_alphabet1.value = sha1(alphabet);
  encrypt_();
});

alphabet_default.addEventListener("click", event => {
  event.preventDefault();
  default_key();
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
