const prng = function(seed) {
  this._seed = seed % 2147483647;
  if (this._seed <= 0) {
    this._seed += 2147483646;
  }
};

prng.prototype.next = function(a, b) {
  this._seed = (this._seed * 48271) % 2147483647;
  if (arguments.length === 0) {
    return this._seed / 2147483647;
  } else if (arguments.length === 1) {
    return (this._seed / 2147483647) * a;
  } else {
    return (this._seed / 2147483647) * (b - a) + a;
  }
};

export { prng };
