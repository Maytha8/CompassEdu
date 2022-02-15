'use strict';
module.exports = function(chai, util) {
  const assert = chai.assert;
  /**
   * Check if an asynchronous function throws a certain error.
   * @param {Function} method - The asynchronous function to call.
   * @param {Function} [class] - The expected error class.
   * @param {String} message - The expected error message.
   */
  assert.throwsAsync = async function(method, arg1, arg2) {
    let err = null;
    try {
      await method();
    } catch (e) {
      err = e;
    }
    assert(err !== null, `expected ${typeof arg1 === 'function' || typeof arg1 === 'object' ? arg1.constructor.name : 'an error'} to be thrown, but none was thrown`);
    assert.throws(function() {
      throw err;
    }, arg1, arg2);
  };
};
