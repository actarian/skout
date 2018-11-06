/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

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

    static differs(a, b) {
        return a.height != b.height || a.width != b.width || a.y !== b.y || a.x !== b.x;
    }

    static overlaps(a, b) {
        const c = 0.1;
        return !(b.left + c > a.right || b.right < a.left + c || b.top + c > a.bottom || b.bottom < a.top + c);
    }

}