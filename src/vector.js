var Vector = function() {
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
};