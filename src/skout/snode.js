/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';

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
        // console.log('SNode =>', node.type);
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
        this.styleText = object.sketchObject.CSSAttributeString().trim();
        this.className = name.replace(/(?!-)(?!_)(\W*)/g, '');
        this.pathNames = (parent && Array.isArray(parent.pathNames)) ? [].concat(parent.pathNames, [parent.className]) : [];
        this.classes = [this.className];
        //
        // console.log(`.${this.pathNames.join(' > .')} > .${this.className}`);
        this.frame = SNode.getFrame(object, type);
        this.layout = {};
        this.style = {};
        //
        Object.defineProperty(this, 'parent', {
            value: parent,
            writable: false
        });
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
        const attributes = {
            className: this.classes.join(' '),
            style: this.style,
            //n, SNode.cssStyle(this.styleText)),
            // style: this.styleText
        };
        return attributes;
    }

    layoutNodes(layout) {
        if (this.nodes.length > 1) {
            const largest = this.nodes.reduce((a, b) => a.frame.width >= b.frame.width && a.frame.height > b.frame.height ? a : b);
            largest.isLargest = true;
            const horizontals = this.nodes.slice().sort((a, b) => a.frame.left - b.frame.left);
            const isHorizontal = horizontals.reduce((a, b) => (a && b && a.frame.right <= b.frame.left) ? b : null);
            this.isHorizontal = isHorizontal;
            const verticals = this.nodes.slice().sort((a, b) => a.frame.top - b.frame.top);
            const isVertical = verticals.reduce((a, b) => (a && b && a.frame.bottom <= b.frame.top) ? b : null);
            this.isVertical = isVertical;
        }
        this.nodes.forEach((a, i) => {
            a.hasSibilings = this.nodes.length > 1;
            if (a.hasSibilings) {
                this.nodes.filter(b => b !== a).forEach(b => {
                    a.hasOverlaps = a.hasOverlaps || SNode.overlaps(a.frame, b.frame);
                });
            }
            a.layoutNode(layout, i);
        });
        if (this.isHorizontal) {
            this.nodes.sort((a, b) => a.frame.left - b.frame.left);
        } else {
            this.nodes.sort((a, b) => (a.frame.top * 10000 + a.frame.left) - (b.frame.top * 10000 + b.frame.left));
        }
    }

    layoutNode(layout, i) {
        Object.assign(this.layout, layout);
        this.isLargest = this.isLargest || false;
        this.layout.zIndex = i;
        this.layout.isLargest = this.isLargest;
        this.layout.hasSibilings = this.hasSibilings;
        this.layout.hasOverlaps = this.hasOverlaps;
        /*
        this.layout.position = 'relative';
        if (this.hasSibilings && this.hasOverlaps && this.isLargest) {
            this.layout.position = 'absolute';
        }
        */

        /*
        this.layout.display = 'block';
        this.layout.position = this.hasOverlaps && this.isLargest ? 'absolute' : 'relative';
        */
        this.layout.position = 'absolute';
        /*
         if (this.isLargest || !this.hasSibilings || !this.hasOverlaps) {
             this.layout.position = 'relative';
         } else {
             this.layout.position = 'absolute';
         }
         */
        /*
        if (this.layout.position === 'relative') {
            console.log(this.className, this.layout.position, 'isLargest', this.isLargest);
        }
        */
        const col = layout.cols.reduce((prev, curr, i) => {
            return (Math.abs(curr - this.frame.width) <= 1 ? (i + 1) : prev);
        });
        if (col === layout.numberOfColumns) {
            this.classes.push('container');
        } else if (col < layout.numberOfColumns) {
            this.classes.push('col-' + col);
        }
        this.frame.width = layout.cols[col - 1] || this.frame.width;
        this.layoutNodes(layout);
        this.style = this.getStyle();
    }

    getStyle() {
        const layout = this.layout;
        const frame = this.frame;
        const style = {
            zIndex: layout.zIndex,
            display: layout.display,
            position: layout.position,
            top: (layout.position === 'relative') ? 'auto' : frame.top + 'px',
            left: (layout.position === 'relative') ? 'auto' : frame.left + 'px',
            width: (frame.width === layout.maxWidth) ? '100%' : frame.width + 'px',
            height: frame.height + 'px',
            // background: 'rgba(0,0,0,0.05)'
        };
        if (this.isHorizontal) {
            style.display = 'flex';
            style.flexDirection = 'row';
            style.justifyContent = 'space-between';
            style.alignItems = 'center';
        }
        if (this.isVertical) {
            style.display = 'flex';
            style.flexDirection = 'column';
            style.justifyContent = 'flex-start';
            style.alignItems = 'flex-start';
        }
        return style;
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