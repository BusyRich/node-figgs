var figgs = require('./../figgs.js'),
    expect = require('expect.js');

describe('Figgs', function() {
  process.env.TEST_VAR = 'test envar';
  process.env.floatValue = '98.656';

  var envIndex = 2,
      xFigg = figgs.factory(__dirname + '/extend.figgs', {default_index:envIndex}),
      hFigg = figgs.factory(__dirname + '/hierarchy.figgs')
      pFigg = figgs.factory(__dirname + '/placeholders.figgs');

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

  describe('Placeholders', function() {
    describe('environment variable', function() {
      it('should load an environment varialbe', function() {
        expect(pFigg.figg.envar).to.be('test envar');
      });

      it('should load a default value when the environment variable does not exist', function() {
        delete process.env.TEST_VAR;
        pFigg.load();

        expect(pFigg.figg.envar).to.be('default');
      });

      it('should convert variable placeholders to numbers if possible', function() {
        pFigg.load();

        expect(pFigg.figg.int).to.equal(99999);
        expect(pFigg.figg.float).to.equal(98.656);
      });
    });

    describe('figg reference', function() {
      it('should reference a value in another part of the figg', function() {
        expect(pFigg.figg.nested.value).to.be('I am really nested.');
      });
    });
  });
});