import assert from 'assert';
import { PropTypes } from 'react';
import { Union, Maybe, Result } from 'results';
import { unionOf, maybeOf, resultOf } from './index';


const check = (checker, value, shouldPass) => {
  const result = checker({ a: value }, 'a', 'testComponent', 'prop');
  if (shouldPass) {
    assert.ifError(result);
  } else {
    assert.ok(result instanceof Error, `expected to fail, but found a '${typeof result}' instead of an Error (${JSON.stringify(result)})`);
  }
};


describe('Custom union', () => {
  const U = Union({ A: null });
  const aEmpty = U.A();
  const aOk = U.A(true);

  const checkU = (checkers, option, shouldPass) =>
    check(unionOf(U, checkers), option, shouldPass);

  describe('wrong type', () => {
    it('should fail', () =>
      checkU({ A: null }, 'not a U', false));
  });

  describe('bad check spec', () => {
    it('should fail', () =>
      checkU({ B: null }, aEmpty, false));
  });

  describe('empty option', () => {
    const uEmpty = { A: null };
    it('should pass with no payload', () =>
      checkU(uEmpty, aEmpty, true));
    it('should fail with a payload', () =>
      checkU(uEmpty, aOk, false));
  });

  describe('one bool option', () => {
    const uBool = { A: PropTypes.bool.isRequired };
    it('should fail with no payload', () =>
      checkU(uBool, aEmpty, false));
    it('should pass with a bool payload', () =>
      checkU(uBool, aOk, true));
  });

});


describe('maybeOf', () => {

  it('should pass a None', () =>
    check(maybeOf(PropTypes.string), Maybe.None(), true))

  it('should check a Some', () => {
    check(maybeOf(PropTypes.string.isRequired), Maybe.Some(), false);
    check(maybeOf(PropTypes.string), Maybe.Some(123), false);
    check(maybeOf(PropTypes.string), Maybe.Some('a string'), true);
  });
});


describe('resultOf', () => {

  it('should check Ok and Err checkers', () => {
    const checker = resultOf({
      Ok: PropTypes.string.isRequired,
      Err: PropTypes.instanceOf(Error).isRequired
    });
    check(checker, Result.Ok(), false);
    check(checker, Result.Ok(123), false);
    check(checker, Result.Ok('abc'), true);
    check(checker, Result.Err(), false);
    check(checker, Result.Err(123), false);
    check(checker, Result.Err(new Error('abc')), true);
  });
});
