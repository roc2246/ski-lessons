/**
 * Validation utilities for universal purposes
 */

/**
 * Validates that all required arguments are present (not null or undefined).
 *
 * @param {Array} values - Values to validate
 * @param {Array} names - Corresponding argument names for error messages
 */
export function argValidation(values, names) {
  values.forEach((val, i) => {
    if (val === undefined || val === null) {
      throw new Error(`${names[i]} required`);
    }
  });
}

/**
 * Validates that all arguments are of the expected data type.
 *
 * @param {Array} values - Values to validate
 * @param {Array} names - Corresponding argument names for error messages
 * @param {Array} types - Corresponding expected types
 */
export function dataTypeValidation(values, names, types) {
  values.forEach((val, i) => {
    if (typeof val !== types[i]) {
      throw new Error(`${names[i]} must be a ${types[i]}`);
    }
  });
}
