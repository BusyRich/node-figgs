var util = require('util');

/*
 * Simple copy.
 */
util.copy = copy = function(obj) {
  var cp = {};

  for(var p in obj) {
    if(typeof obj[p] === 'object') {
      cp[p] = copy(obj[p]);
    } else {
      cp[p] = obj[p];
    }
  }

  return cp;
};

/*
 * Converts objects in the form {'0':'value'} to an array
 */
util.toArray = toArray = function(obj) {
  var arr = [];

  for(var i in obj) {
    arr.splice(i, 0, obj[i]);
  }

  return arr;
};

module.exports = util;