import sourceMapSupport from "source-map-support";
import server from "./server";

/*
Do not register source map support in the testing environment.
Jest comes with source map support out of the box and installing outside
source map support throws off error line numbers in the build tests.
*/
if (process.env.NODE_ENV !== "test") {
  sourceMapSupport.install();
}

/**
 * Outward-facing server factory function.
 */
export default function feedmeServer(options) {
  const s = server(options);
  return s;
}
