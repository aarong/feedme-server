import check from "check-types";

/**
 * Factory function.
 * @param {Object} options
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @returns {Server}
 */

export default function serverFactory(options) {
  console.log(check, options);
}
