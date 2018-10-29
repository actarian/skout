/* jshint esversion: 6 */

import sketch from 'sketch';
import VNode from 'virtual-dom/vnode/vnode';
import SOptions from './soptions';
import SRect from './srect';
import SStyle from './sstyle';
import SUtil from './sutil';

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
        const groups = SUtil.toGroupNames(object.name);
        const name = groups.pop();
        //
        this.object = object;
        this.sketchObject = object.sketchObject;
        this.id = object.id;
        this.name = name;
        this.groups = groups;
        this.type = type;
        this.zIndex = 0;
        this.constraint = SNode.getConstraint(object);
        this.styleText = object.sketchObject.CSSAttributeString().trim();
        // console.log(`.${this.pathNames.join(' > .')}`);
        this.margin = new SRect();
        this.padding = new SRect();
        this.frame = SNode.getFrame(object, type);
        this.parentFrame = parent ? parent.frame : this.frame;
        this.layout = {};
        this.style = {};
        this.collectedNames = {};
        //
        Object.defineProperty(this, 'parent', {
            value: parent,
            writable: true
        });
        //
        this.getNames(parent);
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

    layoutNode(layout) {
        Object.assign(this.layout, layout);
        const nodes = this.nodes.slice();
        this.isLargest = this.isLargest || false;
        if (this.nodes.length > 1) {
            const largest = nodes.reduce((a, b) => a.frame.width >= b.frame.width && a.frame.height > b.frame.height ? a : b);
            largest.isLargest = true;
            const horizontals = nodes.sort((a, b) => a.frame.left - b.frame.left);
            const isHorizontal = horizontals.reduce((a, b) => (a && b && a.frame.right <= b.frame.left) ? b : null);
            this.isHorizontal = isHorizontal;
            const verticals = nodes.sort((a, b) => a.frame.top - b.frame.top);
            const isVertical = verticals.reduce((a, b) => (a && b && a.frame.bottom <= b.frame.top) ? b : null);
            this.isVertical = isVertical;
        }
        nodes.forEach((a, i) => {
            a.hasSibilings = nodes.length > 1;
            if (a.hasSibilings) {
                nodes.filter(b => b !== a).forEach(b => {
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
        });
        this.setInnerRect();
        // !!!
        /*
        if (this.nodes.length &&
            this.frame.width > this.layout.totalWidth &&
            this.innerRect.width < this.layout.totalWidth) {
            const container = SNode.newContainer(this);
            this.nodes = this.nodes.filter(x => x.absolute).concat([container]);
        }
        */
        this.padding.top = this.innerRect.top;
        this.padding.right = this.frame.width - this.innerRect.right;
        this.padding.bottom = this.frame.height - this.innerRect.bottom;
        this.padding.left = this.innerRect.left;
        // console.log('shouldPrependContainer', this.className, this.frame.width, this.layout.totalWidth, this.innerRect.width);
        if (this.isHorizontal) {
            this.nodes.sort((a, b) => a.frame.left - b.frame.left).forEach((b, i) => {
                if (i > 0) {
                    const a = this.nodes[i - 1];
                    a.margin.right = b.frame.left - a.frame.right;
                }
            });
        } else if (this.isVertical) {
            this.nodes.sort((a, b) => a.frame.top - b.frame.top).forEach((b, i) => {
                if (i > 0) {
                    const a = this.nodes[i - 1];
                    a.margin.bottom = b.frame.top - a.frame.bottom;
                }
            });
        } else {
            this.nodes.sort((a, b) => (a.frame.top * 10000 + a.frame.left) - (b.frame.top * 10000 + b.frame.left));
        }
        this.nodes.forEach((a, i) => {
            a.layoutNode(layout);
        });
        if (SOptions.log.layers) {
            this.logLayers();
        }
        this.style = this.getStyle();
    }

    getNames(parent) {
        const fileName = SStyle.getFileName(this.name);
        let parentType = 'Root',
            pathNames = [],
            nameCount = 0;
        if (parent) {
            parentType = parent.type;
            if (parent.type == 'MSSymbolInstance') {
                pathNames = [parent.className];
            } else if (Array.isArray(parent.pathNames)) {
                pathNames = parent.pathNames.slice();
            }
            nameCount = parent.collectedNames[fileName] || 0;
            nameCount++;
            parent.collectedNames[fileName] = nameCount;
        }
        const className = fileName + (nameCount > 1 ? '-' + nameCount : ''); // SStyle.getClassName(name);
        const classes = [className];
        pathNames.push(className);
        this.parentType = parentType;
        this.fileName = fileName;
        this.className = className;
        this.classes = classes;
        this.pathNames = pathNames;
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
        };
        const style = this.style;
        if (SOptions.inline) {
            attributes.style = style;
        } else {
            SStyle.collectedStyles.push({
                className: this.pathNames.join(' > .'),
                style: style,
            });
        }
        return attributes;
    }

    logLayers() {
        console.log(this.className, ' '.repeat(50 - this.className.length), (this.absolute ? 'abs' : 'rel'), this.frame.width, 'x', this.frame.height);
        this.nodes.forEach((a, i) => {
            console.log(this.className, '=>', a.className, ' '.repeat(50 - this.className.length - 4 - a.className.length), (a.absolute ? 'abs' : 'rel'), a.frame.width, 'x', a.frame.height);
        });
        console.log(' ', ' ');
    }

    getStyle() {
        const layout = this.layout;
        const frame = this.frame;
        const parentFrame = this.parentFrame;
        const classes = this.classes;
        const margin = this.margin;
        const padding = this.padding;
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
        if (parentFrame && parentFrame.width >= layout.maxWidth) {
            const col = layout.cols.reduce((prev, curr, i) => {
                return (Math.abs(curr - frame.width) <= 1 ? (i + 1) : prev);
            });
            if (col === layout.numberOfColumns) {
                classes.push('container'); // !!!
                frame.width = layout.maxWidth;
                this.absolute = false; // !!!
            } else if (col < layout.numberOfColumns) {
                classes.push('col-' + col);
            }
        }
        // this.frame.width = layout.cols[col - 1] || this.frame.width;
        const style = {
            display: 'block',
            position: this.absolute ? 'absolute' : 'relative',
            width: (frame.width === layout.maxWidth) ? '100%' : frame.width + 'px',
            height: frame.height + 'px',
            // width: this.constraint.width ? frame.width + 'px' : (frame.width / parentFrame.width * 100) + '%',
            // height: this.constraint.height ? frame.height + 'px' : (frame.height / parentFrame.height * 100) + '%',
            zIndex: this.zIndex,
            // background: 'rgba(0,0,0,0.05)'
        };
        if (this.absolute) {
            style.top = frame.top + 'px';
            style.left = frame.left + 'px';
        }
        if (this.isHorizontal) {
            style.display = 'flex';
            style.flexDirection = 'row';
            style.justifyContent = 'center';
            style.alignItems = 'center';
            style.height = frame.height + 'px';
            // style.minHeight = '100%';
        }
        if (this.isVertical) {
            style.display = 'flex';
            style.flexDirection = 'column';
            style.justifyContent = 'flex-start';
            style.alignItems = 'flex-start';
        }
        style.margin = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;
        style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
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

    static overlaps(a, b) {
        const c = 0.1;
        return !(b.left + c > a.right || b.right < a.left + c || b.top + c > a.bottom || b.bottom < a.top + c);
    }

    static newContainer(node) {
        const container = new SNode(node);
        container.name = 'container';
        container.type = 'Container';
        container.className = 'container';
        container.pathNames = [].concat(node.pathNames, [container]);
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
                className: 'container',
            };
            const PADDING = true;
            if (PADDING) {
                const style = {
                    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
                };
                if (SOptions.inline) {
                    attributes.style = style;
                } else {
                    SStyle.collectedStyles.push({
                        className: container.pathNames.join(' '),
                        style: style,
                    });
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

SNode.collectedStyles = '';