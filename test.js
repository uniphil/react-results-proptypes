import assert from 'assert';
import { PropTypes } from 'react';
import { Union, Maybe, Result } from 'results';
import { unionOf, maybeOf, resultOf } from './index.es6';


describe('basically works and generates usefull warnings', () => {
  const U = Union({ A: null, B: null });
  const checker = x => PropTypes.shape({
    thing: unionOf(U, {
      A: PropTypes.string,
      B: PropTypes.number.isRequired,
    }),
  })({ testProp: x }, 'testProp', 'TestComponent', 'prop', 'testProp');
  it('should make ok messages', () => {
    const result = unionOf(U, {
      A: PropTypes.string,
      B: PropTypes.number.isRequired,
    })({ testProp: U.A(123) }, 'testProp', 'TestComponent', 'prop', 'testProp');
    assert.equal(String(result), 'Error: Invalid prop `testProp<A>.payload` of type `number` supplied to `TestComponent`, expected `string`.');
  })
  it('should pass something that makes sense', () =>
    assert.ifError(checker({ thing: U.A('a string') })));
  it('should pass through a nested error with a reasonable message', () => {
    let result = checker({ thing: U.A(123) });
    assert.equal(String(result), 'Error: Invalid prop `testProp.thing<A>.payload` of type `number` supplied to `TestComponent`, expected `string`.');
    result = checker({ thing: U.B() });
    assert.equal(String(result), 'Error: Required prop `testProp.thing<B>.payload` was not specified in `TestComponent`.');
  });
  it('should create its own useful error messages', () => {
    const result = checker({ thing: 'not a union at all' });
    assert.equal(String(result), 'Error: Invalid prop `testProp.thing` of type `string` supplied to `TestComponent`, expected Union{A, B}');
  });
});


const check = (checker, value, shouldPass, errMsg) => {
  const result = checker({ testProp: value }, 'testProp', 'testComponent', 'prop', 'testProp');
  if (shouldPass) {
    assert.ifError(result);
  } else {
    assert.ok(result instanceof Error, `expected to fail, but found a '${typeof result}' instead of an Error (${JSON.stringify(result)})`);
    assert.equal(String(result), `Error: ${errMsg}`);
  }
};


describe('Custom union', () => {
  const U = Union({ A: null });
  const aEmpty = U.A();
  const aOk = U.A(true);

  const checkU = (checkers, option, shouldPass, errMsg) =>
    check(unionOf(U, checkers), option, shouldPass, errMsg);

  describe('wrong type', () => {
    it('should fail', () =>
      checkU({ A: null }, 'not a U', false, 'Invalid prop `testProp` of type `string` supplied to `testComponent`, expected Union{A}'));
  });

  describe('bad check spec', () => {
    it('should fail', () =>
      checkU({ B: null }, aEmpty, false, 'prop `testProp` errored while typechecking: Error: unrecognized match option: \'B\''));
  });

  describe('empty option', () => {
    const uEmpty = { A: null };
    it('should pass with no payload', () =>
      checkU(uEmpty, aEmpty, true));
    it('should fail with a payload', () =>
      checkU(uEmpty, aOk, false, 'Invalid prop `testProp<A>.payload` of type `object` supplied to `testComponent`, expected no payload.'));
  });

  describe('one bool option', () => {
    const uBool = { A: PropTypes.bool.isRequired };
    it('should fail with no payload', () =>
      checkU(uBool, aEmpty, false, 'Required prop `testProp<A>.payload` was not specified in `testComponent`.'));
    it('should pass with a bool payload', () =>
      checkU(uBool, aOk, true));
  });

});


describe('maybeOf', () => {

  it('should pass a None', () =>
    check(maybeOf(PropTypes.string), Maybe.None(), true))

  it('should check a Some', () => {
    check(maybeOf(PropTypes.string.isRequired), Maybe.Some(), false, 'Required prop `testProp<Some>.payload` was not specified in `testComponent`.');
    check(maybeOf(PropTypes.string), Maybe.Some(123), false, 'Invalid prop `testProp<Some>.payload` of type `number` supplied to `testComponent`, expected `string`.');
    check(maybeOf(PropTypes.string), Maybe.Some('a string'), true);
  });
});


describe('resultOf', () => {

  it('should check Ok and Err checkers', () => {
    const checker = resultOf({
      Ok: PropTypes.string.isRequired,
      Err: PropTypes.instanceOf(Error).isRequired
    });
    check(checker, Result.Ok(), false, 'Required prop `testProp<Ok>.payload` was not specified in `testComponent`.');
    check(checker, Result.Ok(123), false, 'Invalid prop `testProp<Ok>.payload` of type `number` supplied to `testComponent`, expected `string`.');
    check(checker, Result.Ok('abc'), true);
    check(checker, Result.Err(), false, 'Required prop `testProp<Err>.payload` was not specified in `testComponent`.');
    check(checker, Result.Err(123), false, 'Invalid prop `testProp<Err>.payload` of type `Number` supplied to `testComponent`, expected instance of `Error`.');
    check(checker, Result.Err(new Error('abc')), true);
  });
});
