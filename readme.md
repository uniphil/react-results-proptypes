# Results PropTypes for React

[![Build Status](https://travis-ci.org/uniphil/react-results-proptypes.svg)](https://travis-ci.org/uniphil/react-results-proptypes)

```bash
$ npm install react-results-proptypes
```

```js
import { unionOf, maybeOf } from 'react-results-proptypes';

// this would be declared somewhere else in the app and imported
const MyUnion = Union({ A: null, B: null, C: null });

const MyComponent = React.createClass({
  propTypes: {
    maybeAString: maybeOf(React.PropTypes.string),
    thingFromMyUnion: unionOf(MyUnion, {
      A: React.PropTypes.string,
      B: React.PropTypes.number,
      C: null,
    }),
  },
  ...
});
```

The component above would pass checks if:

  - `maybeAString` were `Maybe.None()` or `Maybe.Some('string')`
  - `thingFromMyUnion` were any of
    - `MyUnion.A('blah')`,
    - `MyUnion.B(42)`,
    - `MyUnion.C()`
