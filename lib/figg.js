var util = require('./util'),
    placeholder = require('./placeholder');

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

var Figg = function(file, options) {
  this._src = file || 'config';
  this.file = null;
  this.options = util.extend(defaults, options || {});
  this.env = null;

  this.full = {};
  this.figg = {};

  return this;
};

Figg.prototype._env = function() {
  this.env = process.env.NODE_ENV;

  for(var e in this.options.environments) {
    if(this.options.environments[e] === this.env) {
      this.env = this.options.environments[e];
      return;
    }
  }

  //Throw an error if an environment was set but not found
  if(typeof this.env === 'string') {
    throw new Error(util.format(errors.notDefined, e));
  }

  this.env = this.options.environments[this.options.hierarchy[this.options.default_index]];
};

Figg.prototype._check = function() {
  for(var e in this.options.environments) {
    if(!this.full.hasOwnProperty(this.options.environments[e])) {
      throw new Error(util.format(errors.notSet, this.options.environments[e]));
    }
  }
};

Figg.prototype._build = function() {
  for(var e = 0; e < this.options.hierarchy.length; e++) {
    if(e === 0) {
      continue;
    }

    this.full[this.options.environments[this.options.hierarchy[e]]] = util.extend(
      this.full[this.options.environments[this.options.hierarchy[e - 1]]],
      this.full[this.options.environments[this.options.hierarchy[e]]]
    );
  }
};

Figg.prototype._placeholders = function() {
  var tmp = '';

  for(var figg in this.options.environments) {
    tmp = this.full[this.options.environments[figg]];
    tmp = placeholder.parse(tmp, tmp);
  }
};

Figg.prototype.load = function() {
  this.file = util.loadJSON(this._src);
  this.full = util.copy(this.file);

  this.options = util.extend(this.options, this.full.options || {});
  delete this.full.options;

  this._check();
  this._placeholders();
  this._build();
  this._env();

  this.figg = this.full[this.env];

  return this;
};

module.exports = Figg;