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
        this.style = {};
        this.collectedNames = {};
        this.absolute = true;
        this.relative = false;
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
            this.nodes.filter(a => a.relative).forEach((a, i) => {
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

    setRelativePosition() {
        const layout = SOptions.layout;
        const nodes = this.nodes.slice();
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
            if (a.hasSmallOverlaps) {
                a.absolute = true;
            } else if (a.hasLargeOverlaps) {
                a.absolute = false;
            } else {
                a.absolute = (a.hasOverlaps && !a.isLargest) ? true : false;
            }
            a.relative = !a.absolute;
        });
    }

    setRelativeLayout() {
        this.isLargest = this.isLargest || false;
        this.padding.top = this.innerRect.top;
        this.padding.right = this.frame.width - this.innerRect.right;
        this.padding.bottom = this.frame.height - this.innerRect.bottom;
        this.padding.left = this.innerRect.left;
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
            a.setRelativeLayout();
        });
        if (SOptions.log.layers) {
            this.logLayers();
        }
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
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

    getStyle() {
        const layout = SOptions.layout;
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
        let style = {};
        if (SOptions.html.relative) {
            // relative positioning
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
            style = {
                // display: 'block',
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
            if (this.nodes.length) {
                style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
            }
        } else {
            // absolute positioning
            style = {
                position: 'absolute',
                top: this.constraint.top ? frame.top + 'px' : (frame.top / parentFrame.height * 100) + '%',
                left: this.constraint.left ? frame.left + 'px' : (frame.left / parentFrame.width * 100) + '%',
                zIndex: this.zIndex,
            };
            if (this.constraint.right) {
                style.right = (parentFrame.width - frame.right) + 'px';
            }
            if (this.constraint.bottom) {
                style.bottom = (parentFrame.height - frame.bottom) + 'px';
            }
            /*
            if (!this.constraint.left && !this.constraint.right) {
                style.left = '50%';
                style.marginLeft = this.constraint.width ? (frame.width * -0.5) + 'px' : (frame.width / parentFrame.width * -50) + '%';
            }
            */
            if (this.constraint.left && this.constraint.right) {
                style.width = 'auto';
            } else {
                style.width = this.constraint.width ? frame.width + 'px' : (frame.width / parentFrame.width * 100) + '%';
            }
            /*
            if (!this.constraint.top && !this.constraint.bottom) {
                style.top = '50%';
                style.marginTop = this.constraint.height ? (frame.height * -0.5) + 'px' : (frame.height / parentFrame.height * -50) + '%';
            }
            */
            if (this.constraint.top && this.constraint.bottom) {
                style.width = 'auto';
            } else {
                style.height = this.constraint.height ? frame.height + 'px' : (frame.height / parentFrame.height * 100) + '%';
            }
        }
        if (this.sketchObject.rotation()) {
            style.transform = `rotateZ(${this.sketchObject.rotation()}deg)`;
        }
        return style;
    }

    setStyle() {
        this.style = this.getStyle();
        this.nodes.forEach(x => x.setStyle());
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

    static overlaps(a, b) {
        const c = 0.1;
        return !(b.left + c > a.right || b.right < a.left + c || b.top + c > a.bottom || b.bottom < a.top + c);
    }

    static getDocument() {
        return sketch.fromNative(context.document);
    }

}

SNode.collectedStyles = '';