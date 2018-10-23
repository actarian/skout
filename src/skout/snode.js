/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import SStyle from './sstyle';

const ResizingConstraint = Object.freeze({
    None: 63,
    Top: 31,
    Right: 62,
    Bottom: 55,
    Left: 59,
    Width: 61,
    Height: 47,
});

export default class SNode {

    constructor(node) {
        console.log('SNode =>', node.type);
        const type = node.type;
        const object = node.object;
        const parent = node.parent;
        const groups = object.name.split('/').map(x => x.trim().replace(/ /g, '-').toLowerCase());
        const name = groups.pop();
        //
        this.object = object;
        this.sketchObject = object.sketchObject;
        this.parentType = parent ? parent.type : null;
        this.id = object.id;
        this.name = name;
        this.groups = groups;
        this.type = type;
        this.constraint = SNode.getConstraint(object);
        this.style = new SStyle();
        this.styleText = object.sketchObject.CSSAttributeString().trim();
        this.className = name.replace(/(?!-)(?!_)(\W*)/g, '');
        //
        this.frame = SNode.getFrame(object, type);
        this.layout = {};
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
    }

    render() {
        return new VNode('div', this.attributes(), this.nodes.map(x => x.render()));
    }

    attributes() {
        return {
            className: this.className,
            style: Object.assign({
                zIndex: this.layout.zIndex,
                position: this.layout.position,
                top: this.getTop(),
                left: this.getLeft(),
                width: this.getWidth(),
                height: this.getHeight(),
                // background: 'rgba(0,0,0,0.05)'
            }, SNode.cssStyle(this.styleText)),
            // style: this.styleText
        };
    }

    getTop() {
        return (this.layout.position === 'relative') ? 'auto' : this.frame.top + 'px';
    }

    getLeft() {
        return (this.layout.position === 'relative') ? 'auto' : this.frame.left + 'px';
    }

    getWidth() {
        return (this.frame.width === SNode.maxWidth) ? '100%' : this.frame.width + 'px';
    }

    getHeight() {
        return this.frame.height + 'px';
    }

    layoutNodes(layout) {
        if (this.nodes.length) {
            const largest = this.nodes.reduce((a, b) => a.frame.width >= b.frame.width && a.frame.height > b.frame.height ? a : b);
            largest.isLargest = true;
        }
        this.nodes.forEach((a, i) => {
            a.hasSibilings = this.nodes.length > 1;
            this.nodes.forEach(b => {
                a.hasOverlaps = a.hasOverlaps || SNode.overlaps(a.frame, b.frame);
            });
            a.layoutNode(layout, i);
        });
        this.nodes.sort((a, b) => (a.frame.top * 10000 + a.frame.left) - (b.frame.top * 10000 + b.frame.left));
    }

    layoutNode(layout, i) {
        Object.assign(this.layout, layout);
        this.isLargest = this.isLargest || false;
        this.layout.zIndex = i;
        this.layout.isLargest = this.isLargest;
        this.layout.hasSibilings = this.hasSibilings;
        this.layout.hasOverlaps = this.hasOverlaps;
        if (this.isLargest || !this.hasSibilings || !this.hasOverlaps) {
            this.layout.position = 'relative';
        } else {
            this.layout.position = 'absolute';
        }
        if (this.layout.position === 'relative') {
            console.log(this.className, this.layout.position, 'isLargest', this.isLargest);
        }
        this.layoutNodes(layout);
    }

    static getConstraint(object) {
        // const resizesContent = (typeof object.sketchObject.resizesContent == 'function') ? object.sketchObject.resizesContent() : 0;
        const resizingConstraint = (typeof object.sketchObject.resizingConstraint == 'function') ? object.sketchObject.resizingConstraint() : 0;
        const constraint = {
            none: resizingConstraint === ResizingConstraint.None,
            top: (resizingConstraint & ResizingConstraint.Top) === resizingConstraint,
            right: (resizingConstraint & ResizingConstraint.Right) === resizingConstraint,
            bottom: (resizingConstraint & ResizingConstraint.Bottom) === resizingConstraint,
            left: (resizingConstraint & ResizingConstraint.Left) === resizingConstraint,
            width: (resizingConstraint & ResizingConstraint.Width) === resizingConstraint,
            height: (resizingConstraint & ResizingConstraint.Height) === resizingConstraint,
        };
        return constraint;
    }

    static getFrame(object, type) {
        if (!object) {
            return;
        }
        const frame = object.sketchObject.frame();
        const width = Math.round(frame.width());
        const height = Math.round(frame.height());
        const left = type === 'MSArtboardGroup' ? 0 : Math.round(frame.x());
        const top = type === 'MSArtboardGroup' ? 0 : Math.round(frame.y());
        const right = left + width;
        const bottom = top + height;
        return {
            top,
            right,
            bottom,
            left,
            width,
            height
        };
    }

    static overlaps(a, b) {
        return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
    }

    static cssStyle(styleText) {
        const style = {};
        styleText.split(';').forEach(x => {
            if (x.indexOf(':') !== -1) {
                const kv = x.split(':');
                style[kv[0].trim()] = kv[1].trim();
            }
        });
        return style;
    }

    static toHash(text) {
        var hash = 0,
            i, chr;
        if (text.length === 0) return hash;
        for (i = 0; i < text.length; i++) {
            chr = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    static toRgb(color) {
        var r = Math.round(color.red() * 255);
        var g = Math.round(color.green() * 255);
        var b = Math.round(color.blue() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + color.alpha() + ')';
    }

}