var Figg = require('./lib/figg.js');

var figgs = {};

figgs.load = function(file) {
  var f = new Figg(file).load();
  return f.figg;
};

module.exports = figgs;