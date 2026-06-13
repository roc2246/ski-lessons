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
  const missing = names.filter((_, i) => values[i] === undefined || values[i] === null);

  if (missing.length > 0) {
    const error = new Error(`Required fields missing: ${missing.join(', ')}`);
    // Adding a status property helps your Express error handler 
    // return a proper 400 Bad Request status code
    error.status = 400; 
    throw error;
  }
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
