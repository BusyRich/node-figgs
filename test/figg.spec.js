var figgs = require('./../figgs.js'),
    expect = require('expect.js');

describe('Figgs', function() {
  var envIndex = 2,
      xFigg = figgs.factory(__dirname + '/extend', {default_index:envIndex}),
      hFigg = figgs.factory(__dirname + '/hierarchy');

  it('should load figg based on NODE_ENV environment variable', function() {
    process.env.NODE_ENV = 'production';

    xFigg.load(__dirname + '/extend');

    expect(xFigg.figg.productionoverride).to.be('production value');

    //reset the hFigg
    delete process.env.NODE_ENV;
    xFigg.load(__dirname + '/extend', {default_index:envIndex});
  });

  it('should throw an error if environment is not found', function() {
    process.env.NODE_ENV = 'notanenv';

    expect(function() { figgs.load(__dirname + '/hierarchy'); }).to.throwException();
    
    delete process.env.NODE_ENV;
  });

  it('should allow quick loading of the figg', function() {
    var figg = figgs.load(__dirname + '/extend');
    expect(figg.delete).to.be('me');
  });

  it('should throw an error when the figg does not exist', function() {
    expect(function() { figgs.load('noafile'); }).to.throwException();
    expect(function() { figgs.load('noafile.json'); }).to.throwException();
  });

  it('should throw an error when an environment cannot be found', function() {
    expect(function() { figgs.load(__dirname + '/figg.nodevelopment'); }).to.throwException();
  });

  it('should load config.json file by default', function() {
    //changes the CWD so the default file can load
    process.chdir('test');

    var fault = figgs.load();

    expect(fault.is).to.be('default file');

    //change the CWD back
    process.chdir('../');
  });

  it('should allow options to be passed through the load function', function() {
    expect(xFigg.options.default_index).to.be(envIndex);
  });

  it('should load options from the figgs file', function() {
    expect(xFigg.options.environments.development).to.be('dev');
  });

  it('should correctly set the default environment', function() {
    expect(xFigg.env).to.be(xFigg.options.hierarchy[envIndex]);
  });

  describe('Extending', function() {
    it('should inherit properties for higher figgs', function() {
      expect(xFigg.full.production.unchanged).to.be(xFigg.full.dev.unchanged);
    });

    it('should be able to override inherited properties', function() {
      expect(xFigg.full.production.productionoverride).not.to.be(xFigg.full.dev.productionoverride);
    });

    it('should allow removing properties by setting it to null', function() {
      expect(xFigg.file.production.delete).to.be(null);
      expect(xFigg.full.dev).to.not.be(null);
      expect(xFigg.full.production).to.not.have.property('deleted');
    });
  });

  describe('Hierarchy', function() {
    it('should be able to define custom environments', function() {
      expect(hFigg.options.environments).to.have.property('space');
      expect(hFigg.options.hierarchy).to.contain('space');
    });

    it('should be able to define a custom hierarchy', function() {
      expect(hFigg.options.hierarchy).to.have.length(4);
      expect(hFigg.options.hierarchy[0]).to.be('space');
      expect(hFigg.options.hierarchy[1]).to.be('production');
      expect(hFigg.options.hierarchy[2]).to.be('development');
      expect(hFigg.options.hierarchy[3]).to.be('staging');
    });

    it('should extend based on the hierarchy', function() {
      expect(hFigg.full.development.productionoverride).to.be('value');
      expect(hFigg.full.staging.productionoverride).to.be('production value');
      expect(hFigg.full.staging.planets).to.be(8);
    });
  });
});