/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

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

const StyleShapes = ['MSRectangleShape', 'MSOvalShape'];

export default class SNode {

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

	constructor(node) {
		const object = node.object;
		const sketchObject = object.sketchObject;
		const parent = node.parent;
		const names = SUtil.getNames(node.name, node.symbolId);
		this.groups = names.groups;
		this.name = names.name;
		this.fileName = names.fileName;
		this.className = names.className;
		this.tagName = names.tagName;
		this.componentClassName = names.componentClassName;
		this.componentTagName = names.componentTagName;
		this.symbolId = node.symbolId;
		this.type = node.type;
		this.rect = node.rect;
		this.originalRect = node.originalRect;
		this.childOfSymbol = node.childOfSymbol;
		this.collectedStyles = node.collectedStyles;
		this.id = object.id;
		this.zIndex = 0;
		this.styleText = object.sketchObject.CSSAttributeString().trim();
		this.margin = new SRect();
		this.padding = new SRect();
		this.style = {};
		this.collectedNames = {};
		if (SOptions.html.relative) {
			this.absolute = false;
			this.relative = true;
		} else {
			this.absolute = true;
			this.relative = false;
		}
		Object.defineProperty(this, 'object', {
			value: object,
			writable: true
		});
		Object.defineProperty(this, 'sketchObject', {
			value: sketchObject,
			writable: true
		});
		Object.defineProperty(this, 'parent', {
			value: parent,
			writable: true
		});
		Object.defineProperty(this, 'parentSymbol', {
			value: parent.type === 'MSSymbolInstance' ? parent : parent.parentSymbol,
			writable: true
		});
		/*
		Object.defineProperty(this, 'sketchObject', {
		    value: sketchObject,
		    writable: true
		});
		*/
		this.classes = [];
		this.overrides = {};
	}

	setPathNames(parentClassName = '', parentPathNames = [], parentCollectedNames = {}, parentType = 'Root') {
		const fileName = this.fileName;
		let pathNames = [],
			nameCount = 0;
		if (parentType == 'MSSymbolInstance') {
			pathNames = [parentClassName];
		} else if (Array.isArray(parentPathNames)) {
			pathNames = parentPathNames.slice();
		}
		nameCount = parentCollectedNames[fileName] || 0;
		nameCount++;
		parentCollectedNames[fileName] = nameCount;
		let uniqueClassName = fileName + (nameCount > 1 ? '-' + nameCount : '');
		/*
		const placeholderInput = this.getPlaceholderInput();
		if (placeholderInput) {
			const className = `${placeholderInput.uniqueClassName}::placeholder`;
			pathNames.push(className);
		} else {
			pathNames.push(uniqueClassName);
		}
		console.log('uniqueClassName', uniqueClassName);
		*/
		pathNames.push(uniqueClassName);
		this.parentType = parentType;
		this.uniqueClassName = uniqueClassName;
		this.classes.push(uniqueClassName);
		this.pathNames = pathNames;
		this.collectedNames = [];
		if (this.containerRect) {
			const absolute = this.renderableNodes(this.absolutes, this.rect);
			absolute.forEach((a, i) => {
				a.setPathNames(uniqueClassName, this.pathNames, this.collectedNames, this.type);
			});
			const relatives = this.renderableNodes(this.relatives, this.containerRect);
			const containerPathNames = pathNames.slice();
			containerPathNames.shift();
			containerPathNames.push('container');
			relatives.forEach((a, i) => {
				a.setPathNames('container', containerPathNames);
			});
		} else {
			this.nodes.forEach((a, i) => {
				a.setPathNames(uniqueClassName, this.pathNames, this.collectedNames, this.type);
			});
		}
	}

	setConstraint() {
		const constraint = SNode.getConstraint(this.object);
		const parent = this.parent;
		const parentRect = parent.rect;
		const originalRect = parent.originalRect;
		const rect = this.rect;
		if (parentRect.width !== originalRect.width) {
			const sx = parentRect.width / originalRect.width;
			if (constraint.left && constraint.right) {
				rect.right = parentRect.width - (originalRect.width - rect.right);
				rect.width = rect.right - rect.left;
			} else {
				if (!constraint.width) {
					rect.width *= sx;
					rect.right = rect.left + rect.width;
				}
				if (constraint.right) {
					rect.right = parentRect.width - (originalRect.width - rect.right);
					rect.left = rect.right - rect.width;
				}
			}
		}
		if (parentRect.height !== originalRect.height) {
			const sy = parentRect.height / originalRect.height;
			if (constraint.top && constraint.bottom) {
				rect.bottom = parentRect.height - (originalRect.height - rect.bottom);
				rect.height = rect.bottom - rect.top;
			} else {
				if (!constraint.height) {
					rect.height *= sy;
					rect.bottom = rect.top + rect.height;
				}
				if (constraint.bottom) {
					rect.bottom = parentRect.height - (originalRect.height - rect.bottom);
					rect.top = rect.bottom - rect.height;
				}
			}
		}
		this.constraint = constraint;
	}

	_setPosition() {
		const layout = SOptions.layout;
		// const nodes = this.nodes.slice();
		const nodes = this.renderableNodes(this.nodes, this.rect).slice();
		/*
		if (this.name === 'control--search') {
			nodes.forEach(x => console.log(x.name));
		}
		*/
		nodes.forEach((a, i) => {
			a.hasSibilings = nodes.length > 1;
			if (a.hasSibilings) {
				nodes.filter(b => b !== a).forEach(b => {
					a.hasOverlaps = a.hasOverlaps || SRect.overlaps(a.rect, b.rect);
					a.hasSmallOverlaps = a.hasSmallOverlaps || (SRect.overlaps(a.rect, b.rect) && a.rect.width >= layout.totalWidth && b.rect.width < layout.totalWidth);
					a.hasLargeOverlaps = a.hasLargeOverlaps || (SRect.overlaps(a.rect, b.rect) && a.rect.width < layout.totalWidth && b.rect.width >= layout.totalWidth);
				});
			}
		});
		const overlaps = nodes.filter(a => a.hasOverlaps);
		if (overlaps.length) {
			const largest = overlaps.reduce((a, b) => a.rect.width >= b.rect.width && a.rect.height > b.rect.height ? a : b);
			largest.isLargest = true;
		}
		nodes.forEach((a, i) => {
			if (a.hasSmallOverlaps) {
				a.absolute = true;
			} else if (a.hasLargeOverlaps) {
				a.absolute = false;
			} else {
				a.absolute = (a.hasOverlaps && !a.isLargest) ? true : false;
			}
			/*
			if (a.rect.width >= layout.totalWidth) {
				if (a.hasSmallOverlaps) {
					a.absolute = true;
				} else if (a.hasLargeOverlaps) {
					a.absolute = false;
				} else {
					a.absolute = (a.hasOverlaps && !a.isLargest) ? true : false;
				}
			} else {
				a.absolute = (a.hasOverlaps && a.isLargest) ? true : false;
			}
			*/
			a.relative = !a.absolute;
		});
		const relatives = nodes; // nodes.filter(x => x.relative);
		if (relatives.length > 1) {
			const horizontals = relatives.sort((a, b) => a.rect.left - b.rect.left);
			const isHorizontal = horizontals.reduce((a, b) => (a && b && a.rect.right <= b.rect.left) ? b : null);
			this.isHorizontal = isHorizontal;
			const verticals = relatives.sort((a, b) => a.rect.top - b.rect.top);
			const isVertical = verticals.reduce((a, b) => (a && b && a.rect.bottom <= b.rect.top) ? b : null);
			this.isVertical = isVertical;
		}
		if (this.name == 'homepage') { // 'control--search') {
			console.log(nodes.map(x =>
				x.isLargest ? 'isLargest' : '' +
				x.absolute ? 'absolute' : '' +
				x.hasLargeOverlaps ? 'hasLargeOverlaps' : '' +
				x.hasSmallOverlaps ? 'hasSmallOverlaps' : ''));
		}
	}

	setPosition() {
		const layout = SOptions.layout;
		const nodes = this.nodes.slice();
		nodes.forEach((a, i) => {
			a.hasSibilings = nodes.length > 1;
			if (a.hasSibilings) {
				nodes.filter(b => b !== a).forEach(b => {
					a.hasOverlaps = a.hasOverlaps || SRect.overlaps(a.rect, b.rect);
					a.hasSmallOverlaps = a.hasSmallOverlaps || (SRect.overlaps(a.rect, b.rect) && a.rect.width >= layout.totalWidth && b.rect.width < layout.totalWidth);
					a.hasLargeOverlaps = a.hasLargeOverlaps || (SRect.overlaps(a.rect, b.rect) && a.rect.width < layout.totalWidth && b.rect.width >= layout.totalWidth);
				});
			}
		});
		const overlaps = nodes.filter(a => a.hasOverlaps);
		if (overlaps.length) {
			const largest = overlaps.reduce((a, b) => a.rect.width >= b.rect.width && a.rect.height > b.rect.height ? a : b);
			largest.isLargest = true;
		}
		if (nodes.length > 1) {
			const horizontals = nodes.sort((a, b) => a.rect.left - b.rect.left);
			const isHorizontal = horizontals.reduce((a, b) => (a && b && a.rect.right <= b.rect.left) ? b : null);
			this.isHorizontal = isHorizontal;
			const verticals = nodes.sort((a, b) => a.rect.top - b.rect.top);
			const isVertical = verticals.reduce((a, b) => (a && b && a.rect.bottom <= b.rect.top) ? b : null);
			this.isVertical = isVertical;
		}
		nodes.forEach((a, i) => {
			if (a.hasSmallOverlaps) {
				a.absolute = true;
			} else if (a.hasLargeOverlaps) {
				a.absolute = false;
			} else {
				if (a.rect.width >= layout.totalWidth) {
					a.absolute = (a.hasOverlaps && !a.isLargest) ? true : false;
				} else {
					a.absolute = (a.hasOverlaps && a.isLargest) ? true : false;
				}
			}
			a.relative = !a.absolute;
		});
	}

	setContainer() {
		const nodes = this.nodes;
		const relatives = nodes.filter(x => x.relative);
		const absolutes = nodes.filter(x => x.absolute);
		const rect = this.rect;
		const innerRect = SRect.fromNodes(relatives);
		const layout = SOptions.layout;
		this.innerRect = innerRect;
		if (nodes.length && rect.width > layout.totalWidth && innerRect.width < layout.totalWidth) {
			const containerRect = new SRect({
				top: innerRect.top,
				left: (rect.width - layout.totalWidth) / 2,
				width: layout.totalWidth,
				height: innerRect.height,
			});
			relatives.forEach(x => {
				x.rect.move(-containerRect.left, -containerRect.top);
				x.parentRect = containerRect;
			});
			const containerInnerRect = SRect.fromNodes(relatives);
			this.containerRect = containerRect;
			this.containerInnerRect = containerInnerRect;
			this.innerRect = new SRect({
				left: 0,
				top: innerRect.top,
				width: rect.width,
				height: innerRect.height,
			});
		}
		this.relatives = relatives;
		this.absolutes = absolutes;
	}

	setMarginAndPaddings() {
		const rect = this.rect;
		const innerRect = this.innerRect;
		const padding = this.padding;
		const nodes = this.containerRect ? this.relatives : this.nodes;
		this.isLargest = this.isLargest || false;
		padding.top = innerRect.top;
		padding.right = rect.width - innerRect.right;
		padding.bottom = rect.height - innerRect.bottom;
		padding.left = innerRect.left;
		// nodes = this.nodes;
		if (this.isHorizontal) {
			nodes.sort((a, b) => a.rect.left - b.rect.left).forEach((b, i) => {
				if (i > 0) {
					const a = nodes[i - 1];
					a.margin.right = b.rect.left - a.rect.right;
				}
			});
		} else if (this.isVertical) {
			nodes.sort((a, b) => a.rect.top - b.rect.top).forEach((b, i) => {
				if (i > 0) {
					const a = nodes[i - 1];
					a.margin.bottom = b.rect.top - a.rect.bottom;
				}
			});
		} else {
			nodes.sort((a, b) => (a.rect.top * 10000 + a.rect.left) - (b.rect.top * 10000 + b.rect.left));
		}
		this.nodes.forEach((a, i) => {
			a.setMarginAndPaddings();
		});
		if (SOptions.log.layers) {
			this.logLayers();
		}
	}

	getStyle() {
		const layout = SOptions.layout;
		const rect = this.rect;
		const parentRect = this.parentRect;
		const margin = this.margin;
		const padding = this.padding;
		/*
		const classes = this.classes;
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
		    console.log(this.uniqueClassName, this.layout.position, 'isLargest', this.isLargest);
		}
		*/
		let style = {};
		if (SOptions.html.relative) {
			// relative positioning
			style = {
				// display: 'block',
				position: this.absolute ? 'absolute' : 'relative',
				width: '100%',
				// width: this.constraint.width ? rect.width + 'px' : (rect.width / parentRect.width * 100) + '%',
				// height: this.constraint.height ? rect.height + 'px' : (rect.height / parentRect.height * 100) + '%',
				zIndex: this.zIndex,
				// background: 'rgba(0,0,0,0.05)'
			};
			/*
			if (rect.width === layout.maxWidth || rect.width === layout.totalWidth || rect.width === parentRect.width) {
				style.width = '100%';
				style.maxWidth = rect.width + 'px';
			} else {
				style.width = rect.width + 'px';
			}
			*/

			if (this.absolute) {
				style.top = rect.top + 'px';
				style.left = rect.left + 'px';
				style.height = rect.height + 'px';
				style.maxWidth = rect.width + 'px';

			} else if (parentRect && parentRect.width >= layout.totalWidth) {
				const col = layout.cols.reduce((x, col, i) => {
					return (Math.abs(col - rect.width) <= 1 ? (i + 1) : x);
				}, 0);
				if (col > 0 && col < layout.numberOfColumns + 1) {
					this.classes.push(`col-${col}`);
					style.minHeight = `${rect.height}px`;
				} else {
					style.maxWidth = rect.width + 'px';
					if (this.type !== 'MSTextLayer') {
						style.minHeight = `${rect.height}px`;
					}
				}
			} else {
				if (rect.width < parentRect.width) {
					style.maxWidth = rect.width + 'px';
				}
				if (this.type !== 'MSTextLayer') {
					style.height = `${rect.height}px`;
				}
			}

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

			if (!this.parent.isHorizontal) {
				style.margin = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;
			}

			if (this.nodes.length) {
				if (padding.top < 120 || Math.abs(padding.bottom - padding.top) > 1) {
					style.paddingTop = `${padding.top}px`;
					style.paddingBottom = `${padding.bottom}px`;
				} else {
					style.alignItems = 'center';
				}
				if (padding.left < 120 || Math.abs(padding.right - padding.left) > 1) {
					style.paddingLeft = `${padding.left}px`;
					style.paddingRight = `${padding.right}px`;
				} else {
					style.justifyContent = 'center';
				}
				// style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
			}

			const placeholder = this.getInputPlaceholder();
			if (placeholder) {
				console.log('placeholder', placeholder.rect);
			}

		} else if (SOptions.html.exact) {
			style = {
				position: 'absolute',
				top: rect.top + 'px',
				left: rect.left + 'px',
				width: rect.width + 'px',
				height: rect.height + 'px',
				zIndex: this.zIndex,
			};
			// style.width = (rect.width / parentRect.width * 100) + '%';
			/*
			if (this.constraint.right) {
			    style.right = (parentRect.width - rect.right) + 'px';
			} else {
			    style.width = rect.width + 'px';
			}
			*/
		} else {
			// absolute positioning
			style = {
				position: 'absolute',
				top: this.constraint.top ? rect.top + 'px' : (rect.top / parentRect.height * 100).toFixed(2) + '%',
				left: this.constraint.left ? rect.left + 'px' : (rect.left / parentRect.width * 100).toFixed(2) + '%',
				zIndex: this.zIndex,
			};
			if (this.constraint.right) {
				style.right = (parentRect.width - rect.right) + 'px';
			}
			if (this.constraint.bottom) {
				style.bottom = (parentRect.height - rect.bottom) + 'px';
			}
			/*
			if (!this.constraint.left && !this.constraint.right) {
			    style.left = '50%';
			    style.marginLeft = this.constraint.width ? (rect.width * -0.5) + 'px' : (rect.width / parentRect.width * -50) + '%';
			}
			*/
			if (this.constraint.left && this.constraint.right) {
				style.width = 'auto';
			} else {
				style.width = this.constraint.width ? rect.width + 'px' : (rect.width / parentRect.width * 100).toFixed(2) + '%';
			}
			/*
			if (!this.constraint.top && !this.constraint.bottom) {
			    style.top = '50%';
			    style.marginTop = this.constraint.height ? (rect.height * -0.5) + 'px' : (rect.height / parentRect.height * -50) + '%';
			}
			*/
			if (this.constraint.top && this.constraint.bottom) {
				style.width = 'auto';
			} else {
				style.height = this.constraint.height ? rect.height + 'px' : (rect.height / parentRect.height * 100).toFixed(2) + '%';
			}
		}
		if (this.sketchObject.rotation()) {
			style.transform = `rotateZ(${this.sketchObject.rotation()}deg)`;
		}
		return style;
	}

	setStyle() {
		this.style = this.getStyle();
		const shape = this.nodes.find(x => x.isShapeForRect(this.rect));
		/*
		if (this.name == 'search-bar') {
		    console.log(this.nodes.map(x => x.name).join(', '));
		}
		*/
		if (shape) {
			// console.log('shape', shape.type, shape.parent.name);
			const shapeStyle = SStyle.parseStyle(shape); // shape.getShapeStyle();
			Object.assign(this.style, shapeStyle);
		}
		this.nodes.forEach(x => x.setStyle());
	}

	getInputPlaceholder() {
		if (this.tagName === 'input') {
			return this.parent.nodes.find(x => x.tagName === 'placeholder');
		}
	}

	getPlaceholderInput() {
		if (this.tagName === 'placeholder') {
			return this.parent.nodes.find(x => x.tagName === 'input');
		}
	}

	isInputPlaceholder() {
		return false; // this.tagName === 'placeholder' && this.parent.nodes.find(x => x.tagName === 'input') !== undefined;
	}

	merge(object) {
		if (object) {
			Object.assign(this, object);
		}
		return this;
	}

	collectStyle(style) {
		let selector = SOptions.component.export ?
			this.pathNames.map((x, i) => {
				return i === 0 ? (this.childOfSymbol ? ':host' : '.' + x) : x;
			}).join(' > .') :
			'.' + this.pathNames.join(' > .');
		// console.log('selector', selector);
		const styleObj = {
			className: this.uniqueClassName,
			selector: selector,
			style: style,
		};
		if (this.type == 'MSSymbolInstance') {
			this.parent.collectedStyles.push(styleObj);
		} else {
			this.collectedStyles.push(styleObj);
		}
		if (this.childOfSymbol) {
			SStyle.collectedComponentStyles.push(styleObj);
		} else {
			SStyle.collectedStyles.push(styleObj);
		}
	}

	collectSharedStyle(sharedStyle) {
		if (SOptions.component.export) {
			this.collectedStyles.push(sharedStyle);
		} else {
			const collected = SStyle.collectedTextStyles.find(x => x.className == sharedStyle.className);
			if (!collected) {
				SStyle.collectedTextStyles.push(sharedStyle);
			}
		}
		this.classes.push(sharedStyle.className);
	}

	isShapeForRect(rect) {
		return this.tagName !== 'input' && this.zIndex === 0 && StyleShapes.indexOf(this.type) !== -1 && SRect.equals(rect, this.rect);
	}

	renderableNodes(nodes, rect) {
		return nodes.filter(x => !x.isShapeForRect(rect) && !x.isInputPlaceholder());
	}

	renderNodes() {
		if (this.containerRect) {
			const absolute = this.renderableNodes(this.absolutes, this.rect).map(x => x.render());
			const relatives = this.renderableNodes(this.relatives, this.containerRect).map(x => x.render());
			const container = new VNode('div', {
				className: 'container'
			}, relatives);
			absolute.push(container);
			return absolute;
		} else {
			return this.renderableNodes(this.nodes, this.rect).map(x => x.render());
		}
	}

	render() {
		return new VNode(this.tagName, this.attributes(), this.renderNodes());
	}

	attributes() {
		const attributes = {
			className: this.classes.join(' '),
		};
		switch (this.tagName) {
			case 'button':
				attributes.type = 'button';
				break;
			case 'input':
				attributes.type = 'text';
				const placeholder = this.getInputPlaceholder();
				if (placeholder) {
					attributes.placeholder = placeholder.innerText;
				}
				break;
		}
		const style = this.style;
		if (SOptions.inline) {
			attributes.style = style;
		} else {
			this.collectStyle(style);
		}
		return attributes;
	}

	logLayers() {
		console.log(this.uniqueClassName, ' '.repeat(50 - this.uniqueClassName.length), (this.absolute ? 'abs' : 'rel'), this.rect.width, 'x', this.rect.height);
		this.nodes.forEach((a, i) => {
			console.log(this.uniqueClassName, '=>', a.uniqueClassName, ' '.repeat(50 - this.uniqueClassName.length - 4 - a.uniqueClassName.length), (a.absolute ? 'abs' : 'rel'), a.rect.width, 'x', a.rect.height);
		});
		console.log(' ', ' ');
	}

}