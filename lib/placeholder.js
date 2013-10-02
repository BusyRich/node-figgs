/*
 * Collection of functions that perform actions
 * based on a placeholder command
 */
var processors = {
  var: function(figg, envar, fault) {
    return process.env[envar.toLowerCase()] || fault;
  },

  figg: function(figg, path) {
    var levels = path.split('.'),
        current = figg;

    for(var l = 0; l < levels.length; l++) {
      if(!current.hasOwnProperty(levels[l])) {
        current = null;
        break;
      }

      current = current[levels[l]];
    }

    return current;
  }
};

/*
 * Parse and process
 */
var placeholder = {
  //Regular expression for parsing placeholders
  regex: /^<([A-Za-z\.]+)(\s(.+?))?>$/,
  command: /^([A-Za-z])\./,

  //Tests if the provided text is in the form of a placeholder
  isPlaceholder: function(text) {
    return this.regex.test(text);
  },

  parse: function(figg, root) {
    var tmp = '';

    for(var k in figg) {
      if(typeof figg[k] === 'object') {
        this.parse(figg[k], root);
      } else if(typeof figg[k] === 'string') {
        if(this.isPlaceholder(figg[k])) {
          tmp = this._parse(figg[k], root);

          if(tmp === null) {
            throw new Error('Error processing placeholders.');
          }

          figg[k] = tmp;
        }
      }
    }
  },

  _parse: function(ph, figg) {
    var breakdown = ph.match(this.regex),
    cmd = breakdown[1],
    params = '',
    args = breakdown[3];
    
    if(cmd.indexOf('.') >= 0) {
      params = cmd.substring(cmd.indexOf('.') + 1);
      cmd = cmd.substring(0, cmd.indexOf('.'));
    }

    if(processors.hasOwnProperty(cmd)) {
      return processors[cmd].call(processors, figg, params, args);
    } else {
      return null;
    }
  }
};

module.exports = placeholder;