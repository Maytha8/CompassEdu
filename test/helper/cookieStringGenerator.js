'use strict';
/**
 * Generate a cookie string with an expiry 1 month from now.
 * @param {String} key - The cookie's key.
 * @param {String} value - The cookie's value.
 * @param {String} [path='/'] The cookie's path.
 * @returns {String} - The cookie string.
 */
module.exports = function(key, value, path='/') {
  // Add 1 month to current date.
  const dateObj = new Date();
  dateObj.setMonth(dateObj.getMonth() + 1);

  // Prepare variables.
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
  const date = dateObj.getUTCDate();
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dateObj.getUTCMonth()];
  const year = dateObj.getUTCFullYear();
  const hour = String(dateObj.getUTCHours()).padStart(2, '0');
  const mins = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const secs = String(dateObj.getUTCSeconds()).padStart(2, '0');

  // Insert variables and return cookie string.
  return `${key}=${value}; expires=${day}, ${date}-${month}-${year} ${hour}:${mins}:${secs} GMT; path=${path}; HttpOnly`;
};
