/* jshint esversion: 6 */

import sketch from 'sketch';
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

const EXTERNAL = true;
const LOG_LAYERS = false;

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
            writable: true
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
            //n, SNode.cssStyle(this.styleText)),
            // style: this.styleText
        };
        const style = this.style;
        if (EXTERNAL) {
            SNode.collectedStyles.push({
                className: this.className,
                pathNames: this.pathNames,
                style: style,
            });
        } else {
            attributes.style = style;
        }
        return attributes;
    }

    layoutNode(layout, zIndex) {
        Object.assign(this.layout, layout);
        this.isLargest = this.isLargest || false;
        this.layout.isLargest = this.isLargest;
        this.layout.hasSibilings = this.hasSibilings;
        this.layout.hasOverlaps = this.hasOverlaps;
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
                    /*
                    if (a.className == 'claim-whatsapp') {
                        console.log(a.className, a.frame, b.frame, SNode.overlaps(a.frame, b.frame));
                    }
                    */
                    a.hasOverlaps = a.hasOverlaps || SNode.overlaps(a.frame, b.frame);
                    a.hasSmallOverlaps = a.hasSmallOverlaps || (SNode.overlaps(a.frame, b.frame) && a.frame.width >= layout.totalWidth && b.frame.width < layout.totalWidth);
                    a.hasLargeOverlaps = a.hasLargeOverlaps || (SNode.overlaps(a.frame, b.frame) && a.frame.width < layout.totalWidth && b.frame.width >= layout.totalWidth);
                });
            }
            /*
            if (a.frame.width >= layout.totalWidth) {
                a.absolute = (a.hasOverlaps && a.isLargest) ? false : true;
            } else {
                a.absolute = (a.hasOverlaps && a.isLargest) ? true : false;
            }
            */
            if (a.hasSmallOverlaps) {
                a.absolute = true;
            } else if (a.hasLargeOverlaps) {
                a.absolute = false;
            } else {
                a.absolute = (a.hasOverlaps && !a.isLargest) ? true : false;
            }
            // a.absolute = (a.hasOverlaps && a.isLargest) ? true : false;
            /*
            if (a.className == 'claim-whatsapp') {
                console.log('claim-whatsapp', a.absolute, a.hasOverlaps, a.isLargest);
            }
            */
        });
        /*
        claim-whatsapp true
        home-hero false
        header-desktop true
        form-login false
        shouldPrependContainer desktop 1440 1280 1440
        rectangle false
        rectangle true
        home-hero-body false
        shouldPrependContainer home-hero 1440 1280 1440
        */
        //
        this.setInnerRect();
        if (this.nodes.length &&
            this.frame.width > this.layout.totalWidth &&
            this.innerRect.width < this.layout.totalWidth) {
            const container = SNode.newContainer(this);
            this.nodes = this.nodes.filter(x => x.absolute).concat([container]);
        }
        // console.log('shouldPrependContainer', this.className, this.frame.width, this.layout.totalWidth, this.innerRect.width);
        //
        if (this.isHorizontal) {
            this.nodes.sort((a, b) => a.frame.left - b.frame.left);
        } else {
            this.nodes.sort((a, b) => (a.frame.top * 10000 + a.frame.left) - (b.frame.top * 10000 + b.frame.left));
        }
        if (LOG_LAYERS) {
            this.logLayers();
        }
        this.nodes.forEach((a, i) => {
            a.layoutNode(layout, i);
        });
        this.style = this.getStyle(zIndex);
    }

    logLayers() {
        console.log(this.className, ' '.repeat(50 - this.className.length), (this.absolute ? 'abs' : 'rel'), this.frame.width, 'x', this.frame.height);
        this.nodes.forEach((a, i) => {
            console.log(this.className, '=>', a.className, ' '.repeat(50 - this.className.length - 4 - a.className.length), (a.absolute ? 'abs' : 'rel'), a.frame.width, 'x', a.frame.height);
        });
        console.log(' ', ' ');
    }

    getStyle(zIndex) {
        const layout = this.layout;
        const frame = this.frame;
        const classes = this.classes;
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
        // this.layout.position = 'absolute';
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
            return (Math.abs(curr - frame.width) <= 1 ? (i + 1) : prev);
        });
        if (col === layout.numberOfColumns) {
            classes.push('container');
        } else if (col < layout.numberOfColumns) {
            classes.push('col-' + col);
        }
        // this.frame.width = layout.cols[col - 1] || this.frame.width;
        const style = {
            display: 'block',
            position: this.absolute ? 'absolute' : 'relative',
            top: this.absolute ? frame.top + 'px' : 'auto',
            left: this.absolute ? frame.left + 'px' : 'auto',
            width: (frame.width === layout.maxWidth) ? '100%' : frame.width + 'px',
            height: frame.height + 'px',
            zIndex: zIndex,
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

    setInnerRect() {
        const innerRect = {
            top: Number.POSITIVE_INFINITY,
            left: Number.POSITIVE_INFINITY,
            bottom: Number.NEGATIVE_INFINITY,
            right: Number.NEGATIVE_INFINITY,
            width: 0,
            height: 0
        };
        if (this.nodes.length) {
            this.nodes.filter(a => !a.absolute).forEach((a, i) => {
                innerRect.top = Math.min(innerRect.top, a.frame.top);
                innerRect.left = Math.min(innerRect.left, a.frame.left);
                innerRect.bottom = Math.max(innerRect.bottom, a.frame.bottom);
                innerRect.right = Math.max(innerRect.right, a.frame.right);
            });
            innerRect.width = innerRect.right - innerRect.left;
            innerRect.height = innerRect.bottom - innerRect.top;
        }
        this.innerRect = innerRect;
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
        const c = 0.1;
        return !(b.left + c > a.right || b.right < a.left + c || b.top + c > a.bottom || b.bottom < a.top + c);
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

    static newContainer(node) {
        const container = new SNode(node);
        container.name = 'container';
        container.type = 'Container';
        container.className = 'container';
        container.pathNames = [];
        container.classes = [container.className];
        container.frame = {
            top: 0,
            left: (node.frame.width - node.layout.totalWidth) / 2,
            width: node.layout.totalWidth,
            height: node.frame.height,
        };
        container.frame.right = container.frame.left + container.frame.width;
        container.frame.bottom = container.frame.top + container.frame.height;
        container.layout = node.layout;
        container.style = {};
        container.parent = node;
        container.nodes = node.nodes.filter(a => !a.absolute);
        container.setInnerRect();
        const padding = {
            left: (container.innerRect.left - container.frame.left),
            top: (container.innerRect.top - container.frame.top),
            bottom: (container.frame.bottom - container.innerRect.bottom),
            right: (container.frame.right - container.innerRect.right),
        };
        container.nodes.forEach(x => {
            x.frame.left -= padding.left;
            x.frame.top -= padding.top;
            x.frame.right = x.frame.left + x.frame.width;
            x.frame.bottom = x.frame.top + x.frame.height;
        });
        container.render = () => {
            const attributes = {
                className: `container container-${container.id}`,
            };
            const PADDING = true;
            if (PADDING) {
                const style = {
                    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
                };
                if (EXTERNAL) {
                    SNode.collectedStyles.push({
                        className: `container-${container.id}`,
                        pathNames: container.pathNames,
                        style: style,
                    });
                } else {
                    attributes.style = style;
                }
            }
            return new VNode('div', attributes, container.nodes.map(x => x.render()));
        };
        return container;
    }

    static getDocument() {
        return sketch.fromNative(context.document);
    }

}

SNode.collectedStyles = [];