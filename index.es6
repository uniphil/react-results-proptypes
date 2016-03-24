import { Union, Maybe, Result } from 'results';

const ANONYMOUS = '<<anonymous>>';


const mapValues = (obj, fn) =>
  Object.keys(obj)
    .map(k => ({ [k]: fn(obj[k], k) }))
    .reduce((a, b) => Object.assign({}, a, b), {});


const thunkify = v =>
  () => v;


function createChainableTypeChecker(validate) {
  function checkType(isRequired, props, propName, componentName, location) {
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      const locationName = location;
      if (isRequired) {
        return new Error(
          `Required ${locationName} \`${propName}\` was not specified in ` +
          `\`${componentName}\`.`
        );
      }
    } else {
      return validate(props, propName, componentName, location);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}


const UnionOf = (U, checks) => {
  const checkerMatch = mapValues(checks, thunkify);
  // TODO: verify that all options are covered
  const validate = (props, propName, componentName, locationName) => {
    let checker;
    try {
      checker = U.match(props[propName], checkerMatch);
    } catch (err) {
      return err;
    }
    if (checker) {
      return checker(props[propName], 'payload', componentName || ANONYMOUS, locationName);
    } else {
      if (props[propName].payload) {
        return new Error('bleh');
      } else {
        return null;
      }
    }
  };
  return createChainableTypeChecker(validate);
};


const ResultsPropTypes = {
  UnionOf,
  MaybeOf: someChecker => UnionOf(Maybe, {
    Some: someChecker,
    None: null
  }),
  ResultOf: resultCheckers => UnionOf(Result, {
    Ok: resultCheckers.Ok,
    Err: resultCheckers.Err
  })
};

export default ResultsPropTypes;
