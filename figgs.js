var Figg = require('./lib/figg.js');

var figgs = {};

figgs.load = function(file, options) {
  var f = new Figg(file, options).load();
  return f.figg;
};

module.exports = figgs;
