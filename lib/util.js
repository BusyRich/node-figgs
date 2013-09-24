var util = require('util');

/*
 * Simple copy
 */
util.copy = copy = function(obj) {
  var cp = {};

  for(var p in obj) {
    if(obj[p] instanceof Array === false && typeof obj[p] === 'object') {
      cp[p] = copy(obj[p]);
    } else {
      cp[p] = obj[p];
    }
  }

  return cp;
};

/*
 * Simple add/replace extend
 */
util.extend = function(obj, ext) {
  var cp = util.copy(obj);

  for(var p in ext) {
    if(!cp.hasOwnProperty(p) || ext[p] instanceof Array || typeof ext[p] !== 'object') {
      cp[p] = ext[p];
    } else {
      cp[p] = util.extend(cp[p], ext[p]);
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