var fs = require('fs'),
    path = require('path'),
    util = require('./util'),
    extend = require('extend');

var defaults = {
  environments: {
    development: 'development',
    staging: 'staging',
    production: 'production'
  },
  hierarchy: [
    'development',
    'staging',
    'production'
  ]
};

var errors = {
  notFound: 'Your figg file "%s" was not found.',
  notSet: 'No figg was found for the "%s" environment.',
  notDefined: 'Environment "%s" has no defined figg.'
};

var tests = {
  hasExt: /\.json$/,
  isPlaceholder: /^<([A-Za-z\.]+) (.+?)>$/
};

/*
 * Loads a json file.
 */
var getFile = function(src) {
  var hasExt = tests.hasExt.test(src);

  //Load the file if it exists
  if((hasExt && fs.existsSync(src)) || 
    (!hasExt && fs.existsSync(src + '.json'))) {
    return require(path.resolve(src));
  }

  throw new Error(util.format(errors.notFound, src));
};

/*
 * Determines the current environment name.
 */
var getEnv = function(envs, def) {
  var env = process.env.NODE_ENV;

  for(var e in envs) {
    if(envs[e] === env) {
      return envs[e];
    }
  }

  //Throw an error if an environment was set but not found
  if(typeof env === 'string') {
    throw new Error(util.format(errors.notDefined, e));
  }

  return envs[def];
};

/*
 * Checks the figg collection to make sure each environment has a figg.
 */
var checkFiggs = function(envs, figgs) {
  for(var e in envs) {
    if(!figgs[envs[e]]) {
      throw new Error(util.format(errors.notSet, envs[e]));
    }
  }
};

var buildFiggs = function(envs, hierarchy, figgs) {
  for(var e = 0; e < hierarchy.length; e++) {
    if(e === 0) {
      continue;
    }

    figgs[envs[hierarchy[e]]] = extend(true,
      util.copy(figgs[envs[hierarchy[e - 1]]]),
      figgs[envs[hierarchy[e]]]
    );
  }
};

var parsePlaceholders = function(figg, root) {
  for(var k in figg) {
    if(typeof figg[k] === 'object') {
      parsePlaceholders(figg[k], figg);
    } else if(typeof figg[k] === 'string') {
      if(tests.isPlaceholder.test(figg[k])) {
        var matches = figg[k].match(tests.isPlaceholder);

        //Environment variable placeholder
        if(matches[1].indexOf('var') === 0) {
          figg[k] = process.env[matches[1].replace(/^var\./, '')] || matches[2];
        } else if(matches[1].indexOf('figg') === 0) {
          var levels = matches[1].replace(/^figg\./, '').split('.'),
              current = root;

            for(var l = 0; l < levels.length; l++) {
              if(!current.hasOwnProperty(levels[l])) {
                current = null;
                break;
              }

              current = current[levels[l]];
            }

            figg[k] = current || matches[2];
        }
      }
    }
  }
};

var figg = {};

/*
 * Main configuration loading function.
 */
figg.load = function(file, options) {
  var c = {}, //The loaded configuration
      f = 'config', //Configuration file
      o = null, //Options
      e = null; //Current node environment

  if(typeof file === 'string') {
    f = file;
  }

  c = getFile(f);
  o = extend(true, util.copy(defaults), c.options || {});

  //extend will convert arrays into "array like objects"
  //they need to be converted back into arrays
  o.hierarchy = util.toArray(o.hierarchy);


  checkFiggs(o.environments, c);
  buildFiggs(o.environments, o.hierarchy, c);

  e = getEnv(o.environments, o.hierarchy[0]);

  c = c[e];

  parsePlaceholders(c, c);
  
  return c;
};

module.exports = figg;