import assert from 'assert';
import { PropTypes } from 'react';
import { Union } from 'results';
import ResultsPropTypes from './index';


describe('Custom union', () => {
  const U = Union({
    A: null,
    B: null
  });
  const aEmpty = U.A();
  const aOk = U.A(true);
  const tooMuchB = U.B(1, 'blah');

  const checkU = (checkers, option, shouldFail) => {
    const validator = ResultsPropTypes.UnionOf(U, checkers);
    const result = validator({ a: option }, 'a', 'testComponent', 'prop');
    if (shouldFail) {
      assert.ok(result instanceof Error);
    } else {
      assert.ifError(result instanceof Error);
    }
  };

  describe('empty option', () => {
    it('should pass with no payload', () => {
      checkU({ A: [], B: [] }, aEmpty, false);
    });
    it('should fail with a payload', () =>
      checkU({ A: [], B: [] }, aOk, true));
  });
  // it('should check unions with no payload', () => {
  //   const result = ResultsPropTypes.UnionOf(U, {
  //     A: [],
  //     B: []
  //   })({a: aEmpty}, 'a', 'testComponent', 'prop');
  //   assert.ifError(result instanceof Error);
  // });
});
