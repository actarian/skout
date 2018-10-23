/* jshint esversion: 6 */

export default class SStyle {

    constructor(object) {
        this.merge(object);
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
    }

}