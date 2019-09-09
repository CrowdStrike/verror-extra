'use strict';

const { describe, it } = require('./helpers/mocha');
const { expect } = require('chai');
const { CustomVError, CustomMultiError } = require('..');

describe(function() {
  describe(CustomVError, function() {
    it(`correctly chains multiple ${CustomVError.name}s`, function() {
      let greatGrandChild = new CustomVError('BZTdEUyzks');
      let grandChild = new CustomVError(greatGrandChild, 'nkFhk917Oc');
      let child = new CustomVError(grandChild, 'qAN6mQkL2L');
      let parent = new CustomVError(child, 'ga4P2EsqHt');

      expect(parent.stack).to.match(/VError: ga4P2EsqHt: qAN6mQkL2L: nkFhk917Oc: BZTdEUyzks.*caused by: VError: qAN6mQkL2L: nkFhk917Oc: BZTdEUyzks.*caused by: VError: nkFhk917Oc: BZTdEUyzks.*caused by: VError: BZTdEUyzks/s);
      expect(parent.stack).to.not.match(/(caused by: .*){4}/s);
    });
  });

  describe(CustomMultiError, function() {
    it('combines normal errors', function() {
      let parent = new Error('ga4P2EsqHt');
      let child = new Error('qAN6mQkL2L');

      let combinedError = new CustomMultiError([parent, child]);

      expect(combinedError.message).to.equal('ga4P2EsqHt: qAN6mQkL2L');
      expect(combinedError.stack).to.match(/Error: ga4P2EsqHt.*caused by: Error: qAN6mQkL2L/s);
      expect(combinedError.stack).to.not.match(/(caused by: .*){2}/s);
    });

    it('combines custom errors', function() {
      let parent = new CustomVError(new Error('6H0QQ7tnUA'), 'ga4P2EsqHt');
      let child = new CustomVError(new Error('w7yobLhe1y'), 'qAN6mQkL2L');

      let combinedError = new CustomMultiError([parent, child]);

      expect(combinedError.message).to.equal('ga4P2EsqHt: 6H0QQ7tnUA: qAN6mQkL2L: w7yobLhe1y');
      expect(combinedError.stack).to.match(/VError: ga4P2EsqHt: 6H0QQ7tnUA.*caused by: Error: 6H0QQ7tnUA.*caused by: VError: qAN6mQkL2L: w7yobLhe1y.*caused by: Error: w7yobLhe1y/s);
      expect(combinedError.stack).to.not.match(/(caused by: .*){4}/s);
    });

    it('combines N errors', function() {
      let parent = new Error('ga4P2EsqHt');
      let child = new Error('qAN6mQkL2L');
      let grandChild = new Error('nkFhk917Oc');

      let combinedError = new CustomMultiError([parent, child, grandChild]);

      expect(combinedError.message).to.equal('ga4P2EsqHt: qAN6mQkL2L: nkFhk917Oc');
      expect(combinedError.stack).to.match(/Error: ga4P2EsqHt.*caused by: Error: qAN6mQkL2L.*caused by: Error: nkFhk917Oc/s);
      expect(combinedError.stack).to.not.match(/(caused by: .*){3}/s);
    });
  });
});
