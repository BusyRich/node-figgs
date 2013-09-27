var fs = require('fs'),
    path = require('path'),
    util = require('./lib/util'),
    placeholder = require('./lib/placeholder');

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
  ],
  default_index: 0
};

var errors = {
  notFound: 'Your figg file "%s" was not found.',
  notSet: 'No figg was found for the "%s" environment.',
  notDefined: 'Environment "%s" has no defined figg.',
  placeholderError: 'There is an issue with your placeholder "%s"'
};

var tests = {
  hasExt: /\.json$/
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

    figgs[envs[hierarchy[e]]] = util.extend(
      figgs[envs[hierarchy[e - 1]]],
      figgs[envs[hierarchy[e]]]
    );
  }
};

var parsePlaceholders = function(figg, root) {
  var tmp = '';

  for(var k in figg) {
    if(typeof figg[k] === 'object') {
      parsePlaceholders(figg[k], figg);
    } else if(typeof figg[k] === 'string') {
      if(placeholder.isPlaceholder(figg[k])) {
        tmp = placeholder.parse(root, figg[k]);

        if(tmp === null) {
          throw new Error(util.format(errors.placeholderError, figg[k]));
        }

        figg[k] = tmp;
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
  o = util.extend(defaults, c.options || {});

  checkFiggs(o.environments, c);
  buildFiggs(o.environments, o.hierarchy, c);

  e = getEnv(o.environments, o.hierarchy[o.default_index]);

  c = c[e];

  parsePlaceholders(c, c);
  
  return c;
};

module.exports = figg;