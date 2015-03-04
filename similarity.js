/**
 * SimilarityJS - http://XXXXX.com - A bit like Solr, but much smaller and not as bright - @VERSION
 * Copyright (C) @YEAR Markus Boelter
 * MIT Licensed
 * @license
 */

(function(){var Vector = function() {
  this.values = [];
};


Vector.prototype = {
  push: function(v) {
    return this.values.push(v);
  },
  
  
  magnitute: function() {
    var val = 0;
    
    this.values.forEach(function(e) {
      val += Math.pow(e, 2);
    });    
    
    return Math.sqrt(val);
  },
  
  
  dot: function(v) {
    var self = this,
        dot = 0;

    this.values.forEach(function(value, i) {
      dot += self.values[i] * v.values[i];
    });
    
    return dot;
  },
  
  
  angleFrom: function(v) {
    var val = (this.dot(v) / (this.magnitute() * v.magnitute()));
    if (val > 1) { val = 1; }  // deal with rounding issues
    if (val < 0) { val = 0; }  // deal with rounding issues
    return Math.acos(val);
  }
};var Store = function() {
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
};var Index = function() {
  this._init();
};

Index.prototype = {
  // basically our constructor, moved to prototype to be able have .empty()
  _init: function() {
    var self = this;
    self._symbolSerial = 0;
    self._maxBoost = 1;
    self._minScore = 0.3;
    self._maxResults = 10;
    self._fields = new Store();
    self._symbolIds = new Store();
    self._symbols = new Store();
    self._items = new Store();
  },

  // resets everything to defaults, WARNING: discards all data!!!
  empty: function() {
    this._init();
  },

  field: function(name, options) {
    options = options || {};
    this._fields.add(name, options);

    if (options.boost && options.boost > this._maxBoost) { this._maxBoost = options.boost; }  // FIXME: need to test isNumber(options.boost)
  },

  minScore: function(score) {
    this._minScore = score;
  },

  maxResults: function(maxResults) {
    this._maxResults = maxResults;
  },

  add: function(item) {
    var self = this,
        symbols = [];
    
    this._fields.forEach(function(fieldName) {
      if (Array.isArray(item[fieldName])) { 
        symbols = symbols.concat(self._add_symbols_for_field_array(item, fieldName));
      } else if (typeof(item[fieldName]) == 'string') {
        symbols = symbols.concat(self._add_symbol_for_field_string(item, fieldName, item[fieldName]));
      }

    });
    
    this._items.add(item.id, symbols);
  },
  
  similarTo: function(refItemId) {
    var self = this,
        v1 = undefined,
        v2 = undefined;
        refItem = this._items.get(refItemId),
        result = [],
        score = undefined;
    
    this._items.forEach(function(itemId, item) {
      if (itemId == refItemId) { return; }  // no need to compare to ourself
      
      v1 = new Vector();
      v2 = new Vector();
      
      self._union(refItem, item).forEach(function(k) {
        if (refItem.indexOf(k) > -1) {
          v1.push(self._symbols.get(k).w);
        } else {
          v1.push(0);
        }

        if (item.indexOf(k) > -1) {
          v2.push(self._symbols.get(k).w);
        } else {
          v2.push(0);
        }
      });

      score = Math.cos(v1.angleFrom(v2)).toFixed(9);
      
      // threshold for min Score
      if (score > self._minScore) {
        result.push({
          id: itemId,
          score: score,
        });
      }
    });

    // sort results with highest score first
    result.sort(function(a, b) {
      if (a.score > b.score) { return -1; }
      if (a.score < b.score) { return 1; }
      return 0;
    });

    // truncate the list to maxResults, keep complete list if maxResults == -1
    if (self._maxResults > -1 && result.length > self._maxResults) {
      result = result.slice(0, self._maxResults);
    }

    return result;
  },
  
  // compute a uniq symbol for a name-value pair.
  _symbol: function(name, value) {
    return name + ':' + value;
  },
  
  // [1, 2, 3] + [1, 4] = [1, 2, 3, 4]
  _union: function(arr1, arr2) {
    /* adopted from http://stackoverflow.com/questions/4833651/javascript-array-sort-and-unique */
    return arr1.concat(arr2).sort().filter(function(el, i, a) { if (i == a.indexOf(el)) { return 1; } return 0; });
  },

  _add_symbols_for_field_array: function(item, fieldName) {
    var self = this,
        symbols = [];

    item[fieldName].forEach(function(value) {
      symbols = symbols.concat(self._add_symbol_for_field_string(item, fieldName, value));
    });

    return symbols;
  },
  
  _add_symbol_for_field_string: function(item, fieldName, value) {
    var self = this,
        symbol,
        weight,
        symbols = [];
    
    symbol = self._symbol(fieldName, value);
    symbolId = self._symbolIds.get(symbol);

    if (symbolId === undefined) {
      self._symbolSerial++;
      symbolId = self._symbolIds.add(symbol, self._symbolSerial);
      weight = (self._fields.get(fieldName).boost || 1) / self._maxBoost; // normalize

      // Change to this line for better debugging
      // self._symbols.add(self._symbolSerial, {symbol: symbol, w: weight});
      self._symbols.add(self._symbolSerial, {w: weight});
      
      symbols.push(self._symbolSerial);
    } else {
      symbols.push(symbolId);      
    }

    return symbols;
  }
};
var similarity = function() {
  return new Index();
};/**
   * export the module via AMD, CommonJS or as a browser global
   * Export code from https://github.com/umdjs/umd/blob/master/returnExports.js
   */
  ;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(factory)
    } else if (typeof exports === 'object') {
      /**
       * Node. Does not work with strict CommonJS, but
       * only CommonJS-like enviroments that support module.exports,
       * like Node.
       */
      module.exports = factory()
    } else {
      // Browser globals (root is window)
      root.similarity = factory()
    }
  }(this, function () {
    /**
     * Just return a value to define the module export.
     * This example returns an object, but the module
     * can return a function as the exported value.
     */
    return similarity
  }))
})()