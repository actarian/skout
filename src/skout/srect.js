/* jshint esversion: 6 */

export default class SRect {

    constructor(object) {
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;
        this.merge(object);
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
    }

}