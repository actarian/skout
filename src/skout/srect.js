/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

const SRectDefault = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
};

export default class SRect {

    constructor(object) {
        Object.assign(this, SRectDefault);
        this.merge(object);
        this.update();
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
    }

    move(left, top) {
        this.left = left;
        this.top = top;
        this.update();
    }

    update() {
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    }

    toString() {
        return `{ x:${this.left}, y:${this.top}, w:${this.width}, h:${this.height} }`;
    }

    static fromCGRect(rect) {
        const x = Math.round(rect.origin.x);
        const y = Math.round(rect.origin.y);
        const width = Math.round(rect.size.width);
        const height = Math.round(rect.size.height);
        return new SRect({
            left: x,
            top: y,
            width: width,
            height: height,
            right: x + width,
            bottom: y + height,
        });
    }

    static fromCGSize(size) {
        const width = Math.round(size.width);
        const height = Math.round(size.height);
        return new SRect({
            left: 0,
            top: 0,
            width: width,
            height: height,
            right: width,
            bottom: height,
        });
    }

    static fromObject(object) {
        if (object) {
            const type = String(object.sketchObject.className());
            let rect = object.sketchObject.frame().rect();
            if (type === 'MSArtboardGroup') {
                rect = SRect.fromCGSize(rect.size);
            } else {
                rect = SRect.fromCGRect(rect);
            }
            // console.log('SRect.fromObject', rect.toString());
            return rect;
        }
    }

    static fromRects(rects) {
        const rect = {
            top: Number.POSITIVE_INFINITY,
            left: Number.POSITIVE_INFINITY,
            bottom: Number.NEGATIVE_INFINITY,
            right: Number.NEGATIVE_INFINITY,
            width: 0,
            height: 0
        };
        rects.forEach((x, i) => {
            rect.top = Math.min(rect.top, x.top);
            rect.left = Math.min(rect.left, x.left);
            rect.bottom = Math.max(rect.bottom, x.bottom);
            rect.right = Math.max(rect.right, x.right);
        });
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;
        return new SRect(rect);
    }

    static fromNodes(nodes) {
        return SRect.fromRects(nodes.filter(x => x.relative).map(x => x.rect));
    }

    static differs(a, b) {
        return a.height != b.height || a.width != b.width || a.y !== b.y || a.x !== b.x;
    }

    static overlaps(a, b) {
        const c = 0.1;
        return !(b.left + c > a.right || b.right < a.left + c || b.top + c > a.bottom || b.bottom < a.top + c);
    }

}