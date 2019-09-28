import { hex_sha1, hex2binb } from "./sha1";
import { prng } from "./prng";
import {
  default_alphabet,
  default_plaintext,
  cipher_size,
  seed,
  maximus
} from "./common";

export var rnd = new prng(seed);
export var alphabet = [...default_alphabet];
export var plaintext = [...default_plaintext];

export function set_plaintext(text) {
  plaintext = [...text];
}

export function random() {
  return Math.floor(rnd.next(0, maximus));
}

export function sha1(array) {
  return hex_sha1(array.join(""));
}

export function decrypt_cipher(...args) {
  return cipher_function(shift_decrypt)(...args);
}

export function encrypt_cipher(...args) {
  return cipher_function(shift_encrypt)(...args);
}

export function random_key() {
  shuffle(alphabet, Math.floor(rnd.next(0, maximus)));
}

export function default_key() {
  alphabet = [...default_alphabet];
  plaintext = [...default_plaintext];
}

function shuffle(array, seed, rng) {
  rng = new prng(seed);
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(rng.next(i));
    [array[i], array[j]] = [array[j], array[i]];
  }
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

function shuffle_binb(alphabet, str) {
  let array = hex2binb(str);
  shuffle(alphabet, array[0]);
  shuffle(alphabet, array[1]);
  shuffle(alphabet, array[2]);
  shuffle(alphabet, array[3]);
}

function _encrypt(char, j) {
  return alphabet[(alphabet.indexOf(char) + 1 + j) % cipher_size];
}

function _decrypt(char, j) {
  return alphabet[
    cipher_size - 1 - ((cipher_size - alphabet.indexOf(char) + j) % cipher_size)
  ];
}

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
