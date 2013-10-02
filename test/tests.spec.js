var figgs = require('./../figgs.js'),
    expect = require('expect.js');

describe('Figgs', function() {
  var envIndex = 2,
      figg = figgs.factory(__dirname + '/extend.config', {default_index:envIndex});

  it('should allow options to be passed through the load function', function() {
    expect(figg.options.default_index).to.be(envIndex);
  });

  it('should correctly set the default environment', function() {
    expect(figg.env).to.be(figg.options.hierarchy[envIndex]);
  });

});