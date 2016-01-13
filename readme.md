# Results PropTypes for React

[![Build Status](https://travis-ci.org/uniphil/react-results-proptypes.svg)](https://travis-ci.org/uniphil/react-results-proptypes)

```bash
$ npm install react-results-proptypes
```

```js
import { UnionOf, MaybeOf } from 'react-results-proptypes';

// this would be declared somewhere else in the app and imported
const MyUnion = Union({ A: null, B: null, C: null });

const MyComponent = React.createClass({
  propTypes: {
    maybeAString: MaybeOf(React.PropTypes.string),
    thingFromMyUnion: UnionOf(MyUnion, {
      A: [React.PropTypes.string, React.PropTypes.bool],
      B: [React.PropTypes.number],
      C: [],
    }),
  },
  ...
});
```

The component above would pass checks if:

  - `maybeAString` were `Maybe.None()` or `Maybe.Some('string')`
  - `thingFromMyUnion` were any of
    - `MyUnion.A('blah', true)`,
    - `MyUnion.B(42)`,
    - `MyUnion.C()`
