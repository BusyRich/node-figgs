var fs = require('fs'),
    path = require('path'),
    util = require('util');

util.loadJSON = function(src) {
  var hasExt = path.extname(src) === '.json';

  //Load the file if it exists
  if((hasExt && fs.existsSync(src)) || 
    (!hasExt && fs.existsSync(src + '.json'))) {
    return require(path.resolve(src));
  }

  return new Error('Could not load JSON file.');
};

/*
 * Simple copy
 */
util.copy = function(obj) {
  var cp = {};

  for(var p in obj) {
    if(obj[p] !== null && obj[p] instanceof Array === false && typeof obj[p] === 'object') {
      cp[p] = util.copy(obj[p]);
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
    if(cp.hasOwnProperty(p) && ext[p] === null) {
      delete cp[p];
    } else if(!cp.hasOwnProperty(p) || ext[p] instanceof Array || typeof ext[p] !== 'object') {
      cp[p] = ext[p];
    } else {
      cp[p] = util.extend(cp[p], ext[p]);
    }
  }

  return cp;
};

module.exports = util;