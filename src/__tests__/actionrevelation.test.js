/*


Tests on code from feedme-server-core (removed).


*/

import actionRevelation from "../actionrevelation";

describe("The actionRevelation() factory function", () => {
  it("should return appropriately when oldFeedData is supplied", () => {
    expect(
      actionRevelation("someFeed", { feed: "args" }, { feed: "preDeltaData" })
    ).toEqual({
      _feedName: "someFeed",
      _feedArgs: { feed: "args" },
      _oldFeedData: { feed: "preDeltaData" },
      _feedDeltas: [],
      _newFeedData: { feed: "preDeltaData" }
    });
  });

  it("should return appropriately when oldFeedData is not supplied", () => {
    expect(actionRevelation("someFeed", { feed: "args" })).toEqual({
      _feedName: "someFeed",
      _feedArgs: { feed: "args" },
      _oldFeedData: null,
      _feedDeltas: [],
      _newFeedData: null
    });
  });
});

describe("The actionRevelation.newFeedData() function", () => {
  it("should throw if old feed data was not supplied", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.newFeedData();
    }).toThrow(new Error("NO_FEED_DATA: Old feed data was not supplied."));
  });

  it("should return the feed data if old feed data was supplied", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { feed: "preDeltaData" }
    );
    ar.set([], { feed: "postDeltaData" });
    expect(ar.newFeedData()).toEqual({ feed: "postDeltaData" });
  });
});

describe("The actionRevelation._hashable() function", () => {
  it("should return false if old feed data was not supplied", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar._hashable()).toBe(false);
  });

  it("should return the feed data if old feed data was supplied", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { feed: "preDeltaData" }
    );
    expect(ar._hashable()).toBe(true);
  });
});

describe("The actionRevelation._hash() function", () => {
  it("should throw if old feed data was not supplied", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._hash();
    }).toThrow(new Error("NO_FEED_DATA: Old feed data was not supplied."));
  });

  it("should return the feed data if old feed data was supplied", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { feed: "preDeltaData" }
    );
    ar.set([], { member: "myval" });
    expect(ar._hash()).toEqual("2vD60QUu+6QYUPOIEvbbPg==");
  });
});

describe("The actionRevelation._validatePath() function", () => {
  it("should throw if path type is missing or invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._validatePath();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if first path element is non-string", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._validatePath([213]);
    }).toThrow(
      new Error("INVALID_PATH: First path element must be a string if present.")
    );
  });

  it("should throw if second or later path element is invalid (type)", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._validatePath(["abc", false]);
    }).toThrow(
      new Error(
        "INVALID_PATH: Second and later path elements must be strings or non-negative integers."
      )
    );
  });

  it("should throw if second or later path element is invalid (type)", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._validatePath(["abc", false]);
    }).toThrow(
      new Error(
        "INVALID_PATH: Second and later path elements must be strings or non-negative integers."
      )
    );
  });
});

describe("The actionRevelation._hasCircular() function", () => {
  it("should return false for non-object/arrays", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar._hasCircular("string")).toBe(false);
    expect(ar._hasCircular(123)).toBe(false);
    expect(ar._hasCircular(true)).toBe(false);
    expect(ar._hasCircular(undefined)).toBe(false);
    expect(ar._hasCircular(null)).toBe(false);
  });

  it("should return false for objects/array structures containing non-object/arrays", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar._hasCircular({ a: true, b: 123 })).toBe(false);
    expect(ar._hasCircular([true, 123])).toBe(false);
    expect(ar._hasCircular([true, [null], { a: [] }])).toBe(false);
  });

  it("should return false for objects/array structures containing non-cyclical duplicate references", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    const thing = { a: 1, b: 1 };
    expect(ar._hasCircular({ a: thing, b: thing })).toBe(false);
    expect(ar._hasCircular([thing, thing])).toBe(false);
  });

  it("should return true for objects/array with cyclical structures references", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    let val = { a: 1, b: 1 };
    val.c = val;
    expect(ar._hasCircular(val)).toBe(true);
    val = { a: 1, b: 1, c: {} };
    val.c.d = val;
    expect(ar._hasCircular(val)).toBe(true);
    val = [1, 2];
    val.push(val);
    expect(ar._hasCircular(val)).toBe(true);
    val = [1, 2, []];
    val[2].push(val);
    expect(ar._hasCircular(val)).toBe(true);
    val = { a: 1, b: 1, c: [] };
    val.c.push(val);
    expect(ar._hasCircular(val)).toBe(true);
    val = [1, 2, {}];
    val[2].a = val;
    expect(ar._hasCircular(val)).toBe(true);
    val = [[[[[]]]]];
    val[0][0][0][0].push(val);
    expect(ar._hasCircular(val)).toBe(true);
    val = { a: { b: { c: { d: {} } } } };
    val.a.b.c.d.e = val;
    expect(ar._hasCircular(val)).toBe(true);
  });
});

describe("The actionRevelation._hasUndefined() function", () => {
  it("should return false if no undefined exists", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar._hasUndefined("abc")).toBe(false);
    expect(ar._hasUndefined(123)).toBe(false);
    expect(ar._hasUndefined(true)).toBe(false);
    expect(ar._hasUndefined(null)).toBe(false);
    expect(ar._hasUndefined([123, "abc", [true]])).toBe(false);
    expect(ar._hasUndefined({ a: 1, b: { c: false } })).toBe(false);
  });

  it("should return true if undefined exists", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar._hasUndefined(undefined)).toBe(true);
    expect(ar._hasUndefined({ a: undefined })).toBe(true);
    expect(ar._hasUndefined({ a: { b: undefined } })).toBe(true);
    expect(ar._hasUndefined([undefined])).toBe(true);
    expect(ar._hasUndefined([[undefined]])).toBe(true);
    expect(ar._hasUndefined([{ a: undefined }])).toBe(true);
    expect(ar._hasUndefined({ a: [undefined] })).toBe(true);
  });
});

describe("The actionRevelation._validateJsonValue() function", () => {
  it("should throw on circular", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      const o = {};
      o.o = o;
      ar._validateJsonValue(o);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Circular reference present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw on direct undefined", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._validateJsonValue(undefined);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw on nested undefined", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar._validateJsonValue([undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });
});

// Delta operations

describe("The actionRevelation.set() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.set();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.set([]);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.set([], [undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw if writing non-object to root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.set([], 1);
    }).toThrow(
      new Error("INVALID_VALUE: Can only write an object to the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.set(["abc", "def"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, { abc: {} });
    expect(ar.set(["abc", "def"], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Set",
        Path: ["abc", "def"],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual({ abc: { def: "value" } });

    expect(ar.set(["abc", "def2"], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Set",
        Path: ["abc", "def"],
        Value: "value"
      },
      {
        Operation: "Set",
        Path: ["abc", "def2"],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual({ abc: { def: "value", def2: "value2" } });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.set(["abc", "def"], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Set",
        Path: ["abc", "def"],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toBe(null);

    expect(ar.set(["abc", "def2"], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Set",
        Path: ["abc", "def"],
        Value: "value"
      },
      {
        Operation: "Set",
        Path: ["abc", "def2"],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.delete() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.delete();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if path if deleting the root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.delete([]);
    }).toThrow(new Error("INVALID_PATH: Cannot delete the root."));
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.delete(["abc"]);
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { abc: { def: true, def2: false } }
    );
    expect(ar.delete(["abc", "def"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Delete",
        Path: ["abc", "def"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ abc: { def2: false } });

    expect(ar.delete(["abc", "def2"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Delete",
        Path: ["abc", "def"]
      },
      {
        Operation: "Delete",
        Path: ["abc", "def2"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ abc: {} });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.delete(["abc", "def"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Delete",
        Path: ["abc", "def"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.delete(["abc", "def2"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Delete",
        Path: ["abc", "def"]
      },
      {
        Operation: "Delete",
        Path: ["abc", "def2"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.deleteValue() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteValue();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteValue([]);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteValue([], [undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.deleteValue(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { a: 1, b: 1, c: 0 }
    );
    expect(ar.deleteValue([], 1)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteValue",
        Path: [],
        Value: 1
      }
    ]);
    expect(ar._newFeedData).toEqual({ c: 0 });

    expect(ar.deleteValue([], 0)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteValue",
        Path: [],
        Value: 1
      },
      {
        Operation: "DeleteValue",
        Path: [],
        Value: 0
      }
    ]);
    expect(ar._newFeedData).toEqual({});
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.deleteValue([], 1)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteValue",
        Path: [],
        Value: 1
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.deleteValue([], 0)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteValue",
        Path: [],
        Value: 1
      },
      {
        Operation: "DeleteValue",
        Path: [],
        Value: 0
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.prepend() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.prepend();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.prepend([]);
    }).toThrow(new Error("INVALID_VALUE: String value required."));
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.prepend([], 123);
    }).toThrow(new Error("INVALID_VALUE: String value required."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.prepend([], "text");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform string operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.prepend(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { myString: "c" }
    );
    expect(ar.prepend(["myString"], "b")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Prepend",
        Path: ["myString"],
        Value: "b"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myString: "bc" });

    expect(ar.prepend(["myString"], "a")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Prepend",
        Path: ["myString"],
        Value: "b"
      },
      {
        Operation: "Prepend",
        Path: ["myString"],
        Value: "a"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myString: "abc" });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.prepend(["myString"], "b")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Prepend",
        Path: ["myString"],
        Value: "b"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.prepend(["myString"], "a")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Prepend",
        Path: ["myString"],
        Value: "b"
      },
      {
        Operation: "Prepend",
        Path: ["myString"],
        Value: "a"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.append() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.append();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.append([]);
    }).toThrow(new Error("INVALID_VALUE: String value required."));
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.append(["someString"], 123);
    }).toThrow(new Error("INVALID_VALUE: String value required."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.append([], "text");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform string operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.append(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { myString: "c" }
    );
    expect(ar.append(["myString"], "b")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Append",
        Path: ["myString"],
        Value: "b"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myString: "cb" });

    expect(ar.append(["myString"], "a")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Append",
        Path: ["myString"],
        Value: "b"
      },
      {
        Operation: "Append",
        Path: ["myString"],
        Value: "a"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myString: "cba" });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.append(["myString"], "b")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Append",
        Path: ["myString"],
        Value: "b"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.append(["myString"], "a")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Append",
        Path: ["myString"],
        Value: "b"
      },
      {
        Operation: "Append",
        Path: ["myString"],
        Value: "a"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.increment() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.increment();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.increment([]);
    }).toThrow(new Error("INVALID_VALUE: Numeric value required."));
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.increment(["something"], "abc");
    }).toThrow(new Error("INVALID_VALUE: Numeric value required."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.increment([], 123);
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform number operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.increment(["abc"], 1);
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, { myNum: 0 });
    expect(ar.increment(["myNum"], 10)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Increment",
        Path: ["myNum"],
        Value: 10
      }
    ]);
    expect(ar._newFeedData).toEqual({ myNum: 10 });

    expect(ar.increment(["myNum"], 1)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Increment",
        Path: ["myNum"],
        Value: 10
      },
      {
        Operation: "Increment",
        Path: ["myNum"],
        Value: 1
      }
    ]);
    expect(ar._newFeedData).toEqual({ myNum: 11 });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.increment(["myNum"], 10)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Increment",
        Path: ["myNum"],
        Value: 10
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.increment(["myNum"], 1)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Increment",
        Path: ["myNum"],
        Value: 10
      },
      {
        Operation: "Increment",
        Path: ["myNum"],
        Value: 1
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.decrement() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.decrement();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.decrement([]);
    }).toThrow(new Error("INVALID_VALUE: Numeric value required."));
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.decrement(["something"], "abc");
    }).toThrow(new Error("INVALID_VALUE: Numeric value required."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.decrement([], 123);
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform number operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.decrement(["abc"], 1);
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, { myNum: 0 });
    expect(ar.decrement(["myNum"], 10)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Decrement",
        Path: ["myNum"],
        Value: 10
      }
    ]);
    expect(ar._newFeedData).toEqual({ myNum: -10 });

    expect(ar.decrement(["myNum"], 1)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Decrement",
        Path: ["myNum"],
        Value: 10
      },
      {
        Operation: "Decrement",
        Path: ["myNum"],
        Value: 1
      }
    ]);
    expect(ar._newFeedData).toEqual({ myNum: -11 });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.decrement(["myNum"], 10)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Decrement",
        Path: ["myNum"],
        Value: 10
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.decrement(["myNum"], 1)).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Decrement",
        Path: ["myNum"],
        Value: 10
      },
      {
        Operation: "Decrement",
        Path: ["myNum"],
        Value: 1
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.toggle() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.toggle();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.toggle([]);
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform boolean operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.toggle(["abc"]);
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { abc: { def: true, def2: false } }
    );
    expect(ar.toggle(["abc", "def"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Toggle",
        Path: ["abc", "def"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ abc: { def: false, def2: false } });

    expect(ar.toggle(["abc", "def2"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Toggle",
        Path: ["abc", "def"]
      },
      {
        Operation: "Toggle",
        Path: ["abc", "def2"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ abc: { def: false, def2: true } });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.toggle(["abc", "def"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Toggle",
        Path: ["abc", "def"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.toggle(["abc", "def2"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "Toggle",
        Path: ["abc", "def"]
      },
      {
        Operation: "Toggle",
        Path: ["abc", "def2"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.insertFirst() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertFirst();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertFirst([]);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertFirst([], [undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertFirst([], "value");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform array operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.insertFirst(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, { myArray: [] });
    expect(ar.insertFirst(["myArray"], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertFirst",
        Path: ["myArray"],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: ["value"] });

    expect(ar.insertFirst(["myArray"], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertFirst",
        Path: ["myArray"],
        Value: "value"
      },
      {
        Operation: "InsertFirst",
        Path: ["myArray"],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: ["value2", "value"] });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.insertFirst(["myArray"], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertFirst",
        Path: ["myArray"],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.insertFirst(["myArray"], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertFirst",
        Path: ["myArray"],
        Value: "value"
      },
      {
        Operation: "InsertFirst",
        Path: ["myArray"],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.insertLast() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertLast();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertLast([]);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertLast([], [undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertLast([], "value");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform array operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.insertLast(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, { myArray: [] });
    expect(ar.insertLast(["myArray"], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertLast",
        Path: ["myArray"],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: ["value"] });

    expect(ar.insertLast(["myArray"], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertLast",
        Path: ["myArray"],
        Value: "value"
      },
      {
        Operation: "InsertLast",
        Path: ["myArray"],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: ["value", "value2"] });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.insertLast(["myArray"], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertLast",
        Path: ["myArray"],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.insertLast(["myArray"], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertLast",
        Path: ["myArray"],
        Value: "value"
      },
      {
        Operation: "InsertLast",
        Path: ["myArray"],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.insertBefore() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertBefore();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertBefore([]);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertBefore([], [undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertBefore([], "value");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform array operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.insertBefore(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { myArray: [1, 2, 3] }
    );
    expect(ar.insertBefore(["myArray", 1], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertBefore",
        Path: ["myArray", 1],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [1, "value", 2, 3] });

    expect(ar.insertBefore(["myArray", 3], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertBefore",
        Path: ["myArray", 1],
        Value: "value"
      },
      {
        Operation: "InsertBefore",
        Path: ["myArray", 3],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [1, "value", 2, "value2", 3] });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.insertBefore(["myArray", 1], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertBefore",
        Path: ["myArray", 1],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.insertBefore(["myArray", 3], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertBefore",
        Path: ["myArray", 1],
        Value: "value"
      },
      {
        Operation: "InsertBefore",
        Path: ["myArray", 3],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.insertAfter() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertAfter();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if value is missing", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertAfter([]);
    }).toThrow(
      new Error("INVALID_VALUE: Must specify a JSON-expressible value.")
    );
  });

  it("should throw if value is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertAfter([], [undefined]);
    }).toThrow(
      new Error(
        "INVALID_VALUE: Undefined value present. Must be a JSON-expressible value."
      )
    );
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.insertAfter([], "value");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform array operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.insertAfter(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { myArray: [1, 2, 3] }
    );
    expect(ar.insertAfter(["myArray", 1], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertAfter",
        Path: ["myArray", 1],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [1, 2, "value", 3] });

    expect(ar.insertAfter(["myArray", 3], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertAfter",
        Path: ["myArray", 1],
        Value: "value"
      },
      {
        Operation: "InsertAfter",
        Path: ["myArray", 3],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [1, 2, "value", 3, "value2"] });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.insertAfter(["myArray", 1], "value")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertAfter",
        Path: ["myArray", 1],
        Value: "value"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.insertAfter(["myArray", 3], "value2")).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "InsertAfter",
        Path: ["myArray", 1],
        Value: "value"
      },
      {
        Operation: "InsertAfter",
        Path: ["myArray", 3],
        Value: "value2"
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.deleteFirst() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteFirst();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteFirst([], "value");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform array operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.deleteFirst(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { myArray: [1, 2, 3] }
    );
    expect(ar.deleteFirst(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteFirst",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [2, 3] });

    expect(ar.deleteFirst(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteFirst",
        Path: ["myArray"]
      },
      {
        Operation: "DeleteFirst",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [3] });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.deleteFirst(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteFirst",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.deleteFirst(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteFirst",
        Path: ["myArray"]
      },
      {
        Operation: "DeleteFirst",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});

describe("The actionRevelation.deleteLast() function", () => {
  it("should throw if path is invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteLast();
    }).toThrow(new Error("INVALID_PATH: Path must be an array."));
  });

  it("should throw if path references root", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(() => {
      ar.deleteLast([], "value");
    }).toThrow(
      new Error("INVALID_PATH: Cannot perform array operations on the root.")
    );
  });

  it("should throw if oldFeedData is supplied and delta is contextually invalid", () => {
    const ar = actionRevelation("someFeed", { feed: "args" }, {});
    expect(() => {
      ar.deleteLast(["abc"], "value");
    }).toThrow(
      new Error(
        "INVALID_OPERATION: Path references a non-existent location in the feed data."
      )
    );
  });

  it("should add to deltas array, update feed data, and return void on success with oldFeedData", () => {
    const ar = actionRevelation(
      "someFeed",
      { feed: "args" },
      { myArray: [1, 2, 3] }
    );
    expect(ar.deleteLast(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteLast",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [1, 2] });

    expect(ar.deleteLast(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteLast",
        Path: ["myArray"]
      },
      {
        Operation: "DeleteLast",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual({ myArray: [1] });
  });

  it("should add to deltas array and return void on success without oldFeedData", () => {
    const ar = actionRevelation("someFeed", { feed: "args" });
    expect(ar.deleteLast(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteLast",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);

    expect(ar.deleteLast(["myArray"])).toBe(undefined);
    expect(ar._feedDeltas).toEqual([
      {
        Operation: "DeleteLast",
        Path: ["myArray"]
      },
      {
        Operation: "DeleteLast",
        Path: ["myArray"]
      }
    ]);
    expect(ar._newFeedData).toEqual(null);
  });
});
