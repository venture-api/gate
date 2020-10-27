/**
 * Capitalize string
 *
 * @param {String} original - original string
 * @returns {String} - capitalized string
 *
 */
module.exports = (original) => {

    return `${original[0].toUpperCase()}${original.slice(1)}`;
};
