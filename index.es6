import { Union, Maybe, Result } from 'results';

const ANONYMOUS = '<<anonymous>>';


const mapValues = (obj, fn) =>
  Object.keys(obj)
    .map(k => ({ [k]: fn(obj[k], k) }))
    .reduce((a, b) => Object.assign({}, a, b), {});


const thunkify = v =>
  () => v;


function createChainableTypeChecker(validate) {
  function checkType(
    isRequired,
    props,
    propName,
    componentName,
    location,
    propFullName
  ) {
    componentName = componentName || ANONYMOUS;
    if (props[propName] == null) {
      const locationName = location;
      if (isRequired) {
        return new Error(
          `Required ${locationName} \`${propFullName}\` was not specified in ` +
          `\`${componentName}\`.`
        );
      }
    } else {
      return validate(props, propName, componentName, location, propFullName);
    }
  }

  var chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}


export const unionOf = (U, checks) => {
  const checkerMatch = mapValues(checks, thunkify);
  // TODO: verify that all options are covered
  const validate = (props, propName, componentName, locationName, propFullName) => {
    let checker;
    if (!(props[propName] instanceof U.OptionClass)) {
      return new Error(`Invalid ${locationName} \`${propFullName}\` of type \`${typeof props[propName]}\` supplied to \`${componentName}\`, expected Union{${Object.keys(U.options).join(', ')}}`);
    }
    try {
      checker = U.match(props[propName], checkerMatch);
    } catch (err) {
      return new Error(`${locationName} \`${propFullName}\` errored while typechecking: ${err}`);
    }
    const optionName = props[propName].name;
    if (checker) {
      return checker(props[propName], 'payload', componentName || ANONYMOUS, locationName, `${propFullName}<${optionName}>.payload`);
    } else {
      if (props[propName].payload) {
        return new Error(`Invalid ${locationName} \`${propFullName}<${optionName}>.payload\` of type \`${typeof props[propName]}\` supplied to \`${componentName}\`, expected no payload.`)
        return new Error('bleh');
      } else {
        return null;
      }
    }
  };
  return createChainableTypeChecker(validate);
};


export const maybeOf = someChecker => unionOf(Maybe, {
  Some: someChecker,
  None: null
});

export const resultOf = resultCheckers => unionOf(Result, {
  Ok: resultCheckers.Ok,
  Err: resultCheckers.Err
});
