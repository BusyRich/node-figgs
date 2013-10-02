var Figg = require('./lib/figg.js');

var figgs = {};

figgs.load = function(file, options) {
  var f = new Figg(file, options).load();
  return f.figg;
};

figgs.factory = function(file, options) {
  return new Figg(file, options).load();
};

module.exports = figgs;
