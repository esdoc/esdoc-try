/**
 * this is MyClass.
 */
export default class MyClass {
  /**
   * creates a instance of MyClass.
   * @param {number} value - initial value.
   */
  constructor(value){
    /**
     * this is property of MyClass.
     * @type {number}
     * @private
     */
    this._property = value;
  }

  /**
   * this is method of MyClass.
   * @param {number} a - this is a 1st number value.
   * @param {number} b - this is a 2nd number value.
   * @returns {string} repeated Hello
   */
  method(a, b){
    return 'Hello'.repeat((a + b) * this._property);
  }
}
