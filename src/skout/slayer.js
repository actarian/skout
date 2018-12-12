/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import VNode from 'virtual-dom/vnode/vnode';
import SContainer from './scontainer';
import SOptions from './soptions';
import SRect from './srect';
import SStyle from './sstyle';
import { SUtil, toPx, toPxx } from './sutil';

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

export default class SLayer {

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
		this.rotation = sketchObject.rotation();
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
		this.relatives = [];
		this.absolutes = [];
		this.shapes = [];
		this.overrides = {};
	}

	/*
	isShape() {
		return StyleShapes.indexOf(this.type) !== -1;
	}
	*/

	/****************
	CONSTRAINT
	*****************/

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

	setConstraint() {
		const constraint = SLayer.getConstraint(this.object);
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

	/****************
	NODES
	*****************/

	setNodes() {
		if (this.nodes.length === 0) {
			return;
		}
		// parent then childs
		const nodes = SContainer.getNodes(this.nodes).sort(SContainer.sortRowCol);
		const rect = this.rect;
		const o = nodes.reduce((p, n) => {
			if (n.isShapeForRect(rect)) {
				p.shapes.push(n);
			} else {
				// p.renderables.push(n);
				if (n.absolute) {
					p.absolutes.push(n);
				} else {
					p.relatives.push(n);
				}
			}
			return p;
		}, {
			shapes: [],
			// renderables: [],
			absolutes: [],
			relatives: [],
		});
		this.shapes = o.shapes;
		this.absolutes = o.absolutes;
		this.relatives = o.relatives;
		this.nodes = nodes;
		nodes.forEach(x => x.setNodes());
	}

	setPosition() {
		if (this.nodes.length === 0) {
			return;
		}
		const parsed = SContainer.parseNodes({
			parent: this,
			rect: this.rect,
			nodes: this.nodes,
			shapes: this.shapes,
			relatives: this.relatives,
			absolutes: this.absolutes,
			childOfSymbol: this.childOfSymbol,
			collectedStyles: this.collectedStyles,
		});
		Object.assign(this, parsed);
		/*
		if (this.isGrid) console.log('isGrid', this.name);
		if (this.isVertical) console.log('isVertical', this.name);
		if (this.isHorizontal) console.log('isHorizontal', this.name);
		*/
	}

	/* ^ ^ ^ */

	/****************
	MARGIN PADDING
	*****************/

	setMarginAndPaddings() {
		let innerRect = SRect.fromNodes(this.relatives);
		const rect = this.rect;
		const padding = this.padding;
		padding.top = innerRect.top;
		padding.right = rect.width - innerRect.right;
		padding.bottom = rect.height - innerRect.bottom;
		padding.left = innerRect.left;
		if (this.isHorizontal) {
			this.relatives.forEach((b, i) => {
				if (i > 0) {
					const a = this.relatives[i - 1];
					a.margin.right = b.rect.left - a.rect.right;
				}
			});
		} else if (this.isVertical) {
			this.relatives.forEach((b, i) => {
				if (i > 0) {
					const a = this.relatives[i - 1];
					a.margin.bottom = b.rect.top - a.rect.bottom;
				}
			});
		}
		this.nodes.forEach((a, i) => {
			a.setMarginAndPaddings();
		});
	}

	/****************
	PATHNAMES
	*****************/

	/*
	getPlaceholderInput() {
		if (this.tagName === 'placeholder') {
			return this.parent.nodes.find(x => x.tagName === 'input');
		}
	}
	*/

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
		this.nodes.forEach((a, i) => {
			a.setPathNames(uniqueClassName, this.pathNames, this.collectedNames, this.type);
		});
	}

	/****************
	STYLE
	*****************/

	getStyle() {
		const rect = this.rect;
		const parentRect = this.parentRect;
		const margin = this.margin;
		const padding = this.padding;
		let style = {};
		if (SOptions.html.relative) {
			style = {
				position: this.absolute ? 'absolute' : 'relative',
				width: '100%',
				zIndex: this.zIndex,
			};
			if (this.absolute) {
				style.top = toPx(rect.top);
				style.left = toPx(rect.left);
				style.height = toPxx(rect.height);
				style.maxWidth = toPxx(rect.width);
			} else if (this.parent.isGrid) {
				style.minHeight = toPxx(rect.height);
			} else if (this.parent.isContainer) {
				style.maxWidth = toPxx(rect.width);
				if (this.type !== 'MSTextLayer') {
					style.minHeight = toPxx(rect.height);
				}
			} else {
				if (rect.width < parentRect.width) {
					style.maxWidth = toPxx(rect.width);
				}
				if (this.type !== 'MSTextLayer') {
					style.height = toPxx(rect.height);
				}
			}
			if (this.isHorizontal) {
				style.display = 'flex';
				style.flexDirection = 'row';
				style.justifyContent = 'space-between';
				style.alignItems = 'center';
			}
			if (this.isVertical) {
				style.display = 'block';
				style.flexDirection = 'column';
			}
			if (!this.parent.isHorizontal) {
				if (margin.top) {
					style.marginTop = toPx(margin.top);
				}
				if (margin.right) {
					style.marginRight = toPx(margin.right);
				}
				if (margin.bottom) {
					style.marginBottom = toPx(margin.bottom);
				}
				if (margin.left) {
					style.marginLeft = toPx(margin.left);
				}
			}
			if (this.nodes.length) {
				if (padding.top < 120 || Math.abs(padding.bottom - padding.top) > 1) {
					if (padding.top) {
						style.paddingTop = toPxx(padding.top);
					}
					if (padding.bottom) {
						style.paddingBottom = toPxx(padding.bottom);
					}
				} else {
					style.alignItems = 'center';
				}
				if (padding.left < 120 || Math.abs(padding.right - padding.left) > 1) {
					if (padding.left) {
						style.paddingLeft = toPxx(padding.left);
					}
					if (padding.right) {
						style.paddingRight = toPxx(padding.right);
					}
				} else {
					style.justifyContent = 'center';
				}
			}
			const placeholder = this.getInputPlaceholder();
			if (placeholder) {
				const innerRect = placeholder.rect;
				style.paddingTop = toPxx(innerRect.top);
				style.paddingRight = toPxx(rect.width - innerRect.right);
				style.paddingBottom = toPxx(rect.height - innerRect.bottom);
				style.paddingLeft = toPxx(innerRect.left);
			}
		} else if (SOptions.html.exact) {
			style = {
				position: 'absolute',
				top: toPx(rect.top),
				left: toPx(rect.left),
				width: toPxx(rect.width),
				height: toPxx(rect.height),
				zIndex: this.zIndex,
			};
		} else {
			style = {
				position: 'absolute',
				top: this.constraint.top ? toPx(rect.top) : (rect.top / parentRect.height * 100).toFixed(2) + '%',
				left: this.constraint.left ? toPx(rect.left) : (rect.left / parentRect.width * 100).toFixed(2) + '%',
				zIndex: this.zIndex,
			};
			if (this.constraint.right) {
				style.right = toPx(parentRect.width - rect.right);
			}
			if (this.constraint.bottom) {
				style.bottom = toPx(parentRect.height - rect.bottom);
			}
			if (this.constraint.left && this.constraint.right) {
				style.width = 'auto';
			} else {
				style.width = this.constraint.width ? toPxx(rect.width) : (rect.width / parentRect.width * 100).toFixed(2) + '%';
			}
			if (this.constraint.top && this.constraint.bottom) {
				style.width = 'auto';
			} else {
				style.height = this.constraint.height ? toPxx(rect.height) : (rect.height / parentRect.height * 100).toFixed(2) + '%';
			}
		}
		if (this.sketchObject.rotation()) {
			style.transform = `rotateZ(${this.sketchObject.rotation()}deg)`;
		}
		return style;
	}

	isShapeForRect(rect) {
		return this.tagName !== 'input' && this.zIndex === 0 && StyleShapes.indexOf(this.type) !== -1 && SRect.equals(rect, this.rect);
	}

	setStyle() {
		this.style = this.getStyle();
		const shape = this.nodes.find(x => x.isShapeForRect(this.rect));
		if (shape) {
			const shapeStyle = SStyle.parseStyle(shape);
			Object.assign(this.style, shapeStyle);
		}
		this.nodes.forEach(x => x.setStyle());
	}

	/****************
	RENDER
	*****************/

	getInputPlaceholder() {
		if (this.tagName === 'input') {
			return this.parent.nodes.find(x => x.tagName === 'placeholder');
		}
	}

	collectStyle(style) {
		let selector = SOptions.component.export ?
			this.pathNames.map((x, i) => {
				return i === 0 ? (this.childOfSymbol ? ':host' : '.' + x) : x;
			}).join(' > .') :
			'.' + this.pathNames.join(' > .');
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
					// attributes.value = placeholder.innerText;
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

	renderNodes() {
		return this.nodes.filter(x => this.shapes.indexOf(x) === -1).map(x => x.render());
	}

	render() {
		return new VNode(this.tagName, this.attributes(), this.renderNodes());
	}

}
