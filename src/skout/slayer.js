/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SContainer from './scontainer';
import SNode from './snode';
import SOptions from './soptions';
import SRect from './srect';
import { SUtil } from './sutil';

const ResizingConstraint = Object.freeze({
	None: 63,
	Top: 31,
	Right: 62,
	Bottom: 55,
	Left: 59,
	Width: 61,
	Height: 47,
});

export default class SLayer extends SNode {

	constructor(node) {
		super();
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
	const StyleShapes = ['MSRectangleShape', 'MSOvalShape'];

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

}
