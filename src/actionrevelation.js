import _ from "lodash";
import check from "check-types";
import deltaWriter from "feedme-util/deltawriter";
import md5Calculator from "feedme-util/md5calculator";

/**
 *
 *
 * This code was removed from feedme-server-core. Plus tests.
 *
 *
 *
 *
 * Instances are created and used by the application to reveal actions
 * on feeds. Instances are created using actionResponse.revelation().
 *
 * If old feed data is not provided, the structure of each delta is still
 * checked as thoroughly as possible -- i.e. nothing obviously invalid is
 * permitted.
 * @typedef {Object} ActionRevelation
 */

const proto = {};

/**
 * Factory function. Assumes valid args.
 * @param {String} feedName
 * @param {Object} feedArgs
 * @param {?Object} oldFeedData Enables delta verification and hash generation.
 * @returns {ActionRevelation}
 */
export default function actionRevelationFactory(
  feedName,
  feedArgs,
  oldFeedData = null
) {
  const actionRevelation = Object.create(proto);

  /**
   * Feed name that the action will be revealed on.
   * @memberof ActionRevelation
   * @instance
   * @private
   * @type {String}
   */
  actionRevelation._feedName = feedName;

  /**
   * Feed arguments of the feed that the action will be revealed on.
   * @memberof ActionRevelation
   * @instance
   * @private
   * @type {Object}
   */
  actionRevelation._feedArgs = feedArgs;

  /**
   * Pre-delta feed data or null if not supplied.
   * @memberof ActionRevelation
   * @instance
   * @private
   * @type {?Object}
   */
  actionRevelation._oldFeedData = oldFeedData;

  /**
   * Feed deltas resulting from calls to delta operation methods.
   * Valid as the FeedDeltas parameter of an ActionRevelation message.
   * @memberof ActionRevelation
   * @instance
   * @private
   * @type {Array}
   */
  actionRevelation._feedDeltas = [];

  /**
   * The current state of the feed data given delta operations.
   * Null if oldFeedData not supplied.
   * @memberof ActionRevelation
   * @instance
   * @private
   * @type {?Object}
   */
  actionRevelation._newFeedData = _.cloneDeep(oldFeedData);

  return actionRevelation;
}

// Public functions

/**
 * Returns the new state of the feed data with deltas applied.
 * @memberof ActionRevelation
 * @instance
 * @returns {Object}
 * @throws {Error} "NO_FEED_DATA: ..."
 */
proto.newFeedData = function newFeedData() {
  if (!this._oldFeedData) {
    throw new Error("NO_FEED_DATA: Old feed data was not supplied.");
  }

  return this._newFeedData;
};

// Private functions - available to ActionResponse but not outside the package

/**
 * Returns true if old feed data was provided, in which case a hash of the
 * current feed data can be generated, and false otherwise.
 * @memberof ActionRevelation
 * @instance
 * @private
 * @returns {bool}
 */
proto._hashable = function hashable() {
  return !!this._oldFeedData;
};

/**
 * Generate and return a hash of the current feed data.
 * @memberof ActionRevelation
 * @throws {Error} "NO_FEED_DATA: ..."
 * @instance
 * @private
 */
proto._hash = function _hash() {
  if (!this._oldFeedData) {
    throw new Error("NO_FEED_DATA: Old feed data was not supplied.");
  }

  return md5Calculator.calculate(this._newFeedData);
};

/**
 * Verify that some value is a structurally valid path.
 * @memberof ActionRevelation
 * @param {*} path
 * @returns {undefined}
 * @throws {Error} "INVALID_PATH: ..."
 * @instance
 * @private
 */
proto._validatePath = function _validatePath(path) {
  // Check path type
  if (!check.array(path)) {
    throw new Error("INVALID_PATH: Path must be an array.");
  }

  // Check path element types
  if (path.length > 0 && !check.string(path[0])) {
    throw new Error(
      "INVALID_PATH: First path element must be a string if present."
    );
  }
  for (let i = 1; i < path.length; i += 1) {
    if (!check.string(path[i]) && !(check.integer(path[i]) && path[i] >= 0)) {
      throw new Error(
        "INVALID_PATH: Second and later path elements must be strings or non-negative integers."
      );
    }
  }
};

/**
 * Returns true if the value has a circular reference (i.e. if an object
 * or array has itself as an ancestor) and false otherwise.
 * @memberof ActionRevelation
 * @param {*} value
 * @returns {boolean}
 * @instance
 * @private
 */
proto._hasCircular = function _hasCircular(value, ancestors = []) {
  if (!check.object(value) && !check.array(value)) {
    return false;
  }

  if (_.includes(ancestors, value)) {
    return true;
  }

  const newAncestors = _.clone(ancestors);
  newAncestors.push(value);
  let ret = false;
  _.each(value, child => {
    ret = this._hasCircular(child, newAncestors);
    return !ret; // breaks loop if ret is true
  });
  return ret;
};

/**
 * Returns true if the value is or contains undefined, and false otherwise.
 * @memberof ActionRevelation
 * @param {*} value
 * @returns {boolean}
 * @instance
 * @private
 */
proto._hasUndefined = function _hasUndefined(value) {
  if (check.undefined(value)) {
    return true;
  }
  if (check.object(value) || check.array(value)) {
    let ret = false;
    _.each(value, child => {
      ret = this._hasUndefined(child);
      return !ret; // break loop if ret is true
    });
    return ret;
  }
  return false;
};

/**
 * Returns true only if the supplied value is JSON-expressible -- i.e.
 * no circular references and no undefined values. Undefined valuesdon't trigger
 * an error on JSON.stringify(), but may be omitted from the serialization
 * (object children) and may be represented as null (array elements).
 * @memberof ActionRevelation
 * @param {*} value
 * @returns {undefined}
 * @throws {Error} "INVALID_VALUE: ..."
 * @instance
 * @private
 */
proto._validateJsonValue = function _validateJsonValue(value) {
  // Throw if circular
  if (this._hasCircular(value)) {
    throw new Error(
      "INVALID_VALUE: Circular reference present. Must be a JSON-expressible value."
    );
  }

  // If the value argument is missing (or explicitly set to undefined) then
  // give a more intuitive error than the next one (which would otherwise be thrown)
  if (check.undefined(value)) {
    throw new Error("INVALID_VALUE: Must specify a JSON-expressible value.");
  }

  // Throw if has an undefined in it
  if (this._hasUndefined(value)) {
    throw new Error(
      "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
    );
  }
};

// Delta operations

/**
 * Set delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String|number|bool|null|Array|Object} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.set = function set(path, value) {
  this._validatePath(path);
  this._validateJsonValue(value);

  // Can only write objects to the root
  if (path.length === 0 && !check.object(value)) {
    throw new Error("INVALID_VALUE: Can only write an object to the root.");
  }

  // Create the delta
  const delta = {
    Operation: "Set",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * Delete delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.delete = function _delete(path) {
  this._validatePath(path);

  // Throw if root
  if (path.length === 0) {
    throw new Error("INVALID_PATH: Cannot delete the root.");
  }

  // Create the delta
  const delta = {
    Operation: "Delete",
    Path: path
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * DeleteValue delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String|number|bool|null|Array|Object} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.deleteValue = function deleteValue(path, value) {
  this._validatePath(path);
  this._validateJsonValue(value);

  // Create the delta
  const delta = {
    Operation: "DeleteValue",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * Prepend delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.prepend = function prepend(path, value) {
  this._validatePath(path);

  if (!check.string(value)) {
    throw new Error("INVALID_VALUE: String value required.");
  }

  // Throw if root - never a string
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform string operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "Prepend",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * Append delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.append = function append(path, value) {
  this._validatePath(path);

  if (!check.string(value)) {
    throw new Error("INVALID_VALUE: String value required.");
  }

  // Throw if root - never a string
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform string operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "Append",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * Increment delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {number} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.increment = function increment(path, value) {
  this._validatePath(path);

  if (!check.number(value)) {
    throw new Error("INVALID_VALUE: Numeric value required.");
  }

  // Throw if root - never a number
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform number operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "Increment",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * Decrement delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {number} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.decrement = function decrement(path, value) {
  this._validatePath(path);

  if (!check.number(value)) {
    throw new Error("INVALID_VALUE: Numeric value required.");
  }

  // Throw if root - never a number
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform number operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "Decrement",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * Toggle delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.toggle = function toggle(path) {
  this._validatePath(path);

  // Throw if root - never a bool
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform boolean operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "Toggle",
    Path: path
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * InsertFirst delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String|number|bool|null|Array|Object} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.insertFirst = function insertFirst(path, value) {
  this._validatePath(path);
  this._validateJsonValue(value);

  // Throw if root - never an array
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform array operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "InsertFirst",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * InsertLast delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String|number|bool|null|Array|Object} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.insertLast = function insertLast(path, value) {
  this._validatePath(path);
  this._validateJsonValue(value);

  // Throw if root - never an array
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform array operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "InsertLast",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * InsertBefore delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String|number|bool|null|Array|Object} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.insertBefore = function insertBefore(path, value) {
  this._validatePath(path);
  this._validateJsonValue(value);

  // Throw if root - never an array
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform array operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "InsertBefore",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * InsertAfter delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @param {String|number|bool|null|Array|Object} value
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_VALUE: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.insertAfter = function insertAfter(path, value) {
  this._validatePath(path);
  this._validateJsonValue(value);

  // Throw if root - never an array
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform array operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "InsertAfter",
    Path: path,
    Value: value
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * DeleteFirst delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.deleteFirst = function deleteFirst(path) {
  this._validatePath(path);

  // Throw if root - never an array
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform array operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "DeleteFirst",
    Path: path
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};

/**
 * DeleteLast delta operation.
 * @memberof ActionRevelation
 * @instance
 * @param {Array} path
 * @throws {Error} "INVALID_PATH: ..."
 * @throws {Error} "INVALID_OPERATION: ..."
 */
proto.deleteLast = function deleteLast(path) {
  this._validatePath(path);

  // Throw if root - never an array
  if (path.length === 0) {
    throw new Error(
      "INVALID_PATH: Cannot perform array operations on the root."
    );
  }

  // Create the delta
  const delta = {
    Operation: "DeleteLast",
    Path: path
  };

  // Apply the delta to the feed data (if present)
  // The deltaWriter may throw INVALID_OPERATION
  if (this._newFeedData) {
    this._newFeedData = deltaWriter.apply(this._newFeedData, delta);
  }

  // Success
  this._feedDeltas.push(delta);
};
