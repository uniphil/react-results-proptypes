import { Union, UnionError, Maybe, Result } from 'results';


const mapValues = (obj, fn) =>
  Object.keys(obj)
    .map(k => ({ [k]: fn(obj[k], k) }))
    .reduce((a, b) => Object.assign({}, a, b), {});


const thunkify = v =>
  () => v;


const catchOrElse = (ErrType, tryFn, fn) => {
  let result;
  try {
    result = tryFn();
  } catch (err) {
    if (err instanceof ErrType) {
      return err;
    } else {
      throw err;
    }
  }
  return fn(result);
};


const checkAll = (checkers, option, propName, componentName, location) => {
  if (option.data.length !== checkers.length) {
    return new Error(
      `Invalid ${location} '${propName}' supplied to '${componentName}', ` +
      `expected ${checkers.length} payloads for '${option.name}' but found ` +
      `${option.data.length}.`
    );
  }
  return checkers.reduce((acc, checker, i) => {
    if (acc instanceof Error) {
      return acc;
    } else {
      return checker(option.data, i, componentName, location);
    }
  }, null);
}


const UnionOf = (U, bareCheckers) => {
  const checkerMap = mapValues(bareCheckers, thunkify);
  return (props, propName, componentName, location) =>
    catchOrElse(UnionError, () => U.match(props[propName], checkerMap), checkers =>
      checkAll(checkers, props[propName], propName, componentName, location));
};


const ResultsPropTypes = {
  UnionOf,
  MaybeOf: someChecker => UnionOf(Maybe, {
    Some: [someChecker],
    None: []
  }),
  ResultOf: resultCheckers => UnionOf(Result, {
    Ok: [resultCheckers.Ok],
    Err: [resultCheckers.Err]
  })
};

export default ResultsPropTypes;
