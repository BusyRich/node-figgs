var figgs = require('./../figgs.js'),
    expect = require('expect.js'),
    figg = null;

describe('Placeholders', function() {

    before(function() {
      //Add a few environment variables
      process.env.TEST_VAR = 'test envar';
      process.env.floatValue = '98.656';
      process.env.Bool = 'true';

      figg = figgs.factory(__dirname + '/placeholders');
    });

    it('should throw an error when referencing a non-existant placeholder', function() {
      expect(function() { figgs.load(__dirname + '/placeholders.notexist'); }).to.throwException();
    });

    describe('environment variable', function() {
      it('should load an environment varialbe', function() {
        expect(figg.figg.envar).to.be('test envar');
      });

      it('should load a default value when the environment variable does not exist', function() {
        delete process.env.TEST_VAR;
        figg.load();

        expect(figg.figg.envar).to.be('default');
      });

      it('should convert variable placeholders to numbers if possible', function() {
        figg.load();

        expect(figg.figg.int).to.equal(99999);
        expect(figg.figg.float).to.equal(98.656);
      });

      it('should convert variable placeholders to booleans if possible', function() {
        figg.load();

        expect(figg.figg.Boolean).to.equal(true);

        delete process.env.Bool;
        figg.load();

        expect(figg.figg.Boolean).to.equal(false);
      });
    });

    describe('figg reference', function() {
      it('should throw an error when referencing a property that doesnt exist', function() {
        expect(function() { figgs.load(__dirname + '/placeholders.figgerror'); }).to.throwException();
      });

      it('should reference a value in another part of the figg', function() {
        expect(figg.figg.nested.value).to.be('I am really nested.');
      });
    });
  });