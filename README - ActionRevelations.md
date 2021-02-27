##### ActionRevelation Objects

`ActionRevelation` objects provide an interface for revealing actions on feeds
and modifying feed data using delta operations.

To initialize an `ActionRevelation` object use `actionResponse.revelation(...)`.

If a call to `actionResponse.revelation()` supplies an `oldFeedData` argument,
then delta operations are checked for validity and a hash of the updated feed
data is transmitted to the client for integrity verification.

If `oldFeedData` is not supplied, then the application must ensure that it
transmits delta operations that comply with the Feedme specification. Clients
will be unable to perform feed data integrity checks.

`ActionRevelation` objects have the following methods:

- `actionRevelation.newFeedData()`

  Returns the state of the feed data with delta operations applied.

  Errors thrown:

  - `err.message === "NO_FEED_DATA: ..."`

    An `oldFeedData` argument was not supplied when the `ActionRevelation`
    object was created.

- `actionRevelation.set(path, value)`

  Corresponds to the `Set` Feedme delta operation. Writes `value` to `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references a location in the feed data. Any parent objects or arrays must
     already exist.

  2. `value` (any JSON-serializable value) is the value being assigned. Must be
     an object if assigning the root feed data.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.delete(path)`

  Corresponds to the `Delete` Feedme delta operation. Removes the object child
  or array element referenced by `path` from the feed data.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing location in the feed data. Cannot be the root.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.deleteValue(path, value)`

  Corresponds to the `DeleteValue` Feedme delta operation. Removes object
  children/array elements that deep-equal `value` from the object/array
  referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing object or array.

  2. `value` (any JSON-serializable value) is the value against which object
     childrent/array elements are matched.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.prepend(path, value)`

  Corresponds to the `Prepend` Feedme delta operation. Prepends `value` onto the
  string referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing string.

  2. `value` (string) is the value to prepend.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.append(path, value)`

  Corresponds to the `Append` Feedme delta operation. Appends `value` onto the
  string referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing string.

  2. `value` (string) is the value to append.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.increment(path, value)`

  Corresponds to the `Increment` Feedme delta operation. Adds `value` to the
  number referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing number.

  2. `value` (number) is the amount to increment.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.decrement(path, value)`

  Corresponds to the `Decrement` Feedme delta operation. Subtracts `value` from
  the number referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing number.

  2. `value` (number) is the amount to decrement.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.toggle(path)`

  Corresponds to the `Toggle` Feedme delta operation. Inverts the boolean value
  referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing boolean value.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.insertFirst(path, value)`

  Corresponds to the `InsertFirst` Feedme delta operation. Inserts `value` at
  the beginning of the array referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing array.

  2. `value` (any JSON-serializable value) is the value to insert.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.insertLast(path, value)`

  Corresponds to the `InsertLast` Feedme delta operation. Inserts `value` at the
  end of the array referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing array.

  2. `value` (any JSON-serializable value) is the value to insert.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.insertBefore(path, value)`

  Corresponds to the `InsertBefore` Feedme delta operation. Inserts `value`
  before the array element referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing array element.

  2. `value` (any JSON-serializable value) is the value to insert.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.insertAfter(path, value)`

  Corresponds to the `InsertAfter` Feedme delta operation. Inserts `value` after
  the array element referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing array element.

  2. `value` (any JSON-serializable value) is the value to insert.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_VALUE: ..."`

    There was a problem with the value argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.deleteFirst(path)`

  Corresponds to the `DeleteFirst` Feedme delta operation. Removes the first
  element of the array referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing array. The array must not be empty.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.

- `actionRevelation.deleteLast(path)`

  Corresponds to the `DeleteLast` Feedme delta operation. Removes the last
  element of the array referenced by `path`.

  Arguments:

  1. `path` ([path array](https://github.com/aarong/feedme-spec#paths))
     references an existing array. The array must not be empty.

  Errors thrown:

  - `err.message === "INVALID_PATH: ..."`

    There was a problem with the path argument.

  - `err.message === "INVALID_OPERATION: ..."`

    The delta operation was invalid given the current state of the feed data.
