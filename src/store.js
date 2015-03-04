var Store = function() {
  this._data = {};
};

Store.prototype = {
  add: function(k, v) {
    this._data[k] = v;
    return k;
  },

  get: function(k) {
    return this._data[k];
  },
  
  forEach: function(callback) {
    for (k in this._data) {
      callback(k, this._data[k]);
    };
  }
};