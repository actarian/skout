/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SNode from './snode';
import SRect from './srect';
import SUtil, { toPx, toPxx } from './sutil';

export default class SCol extends SNode {

	constructor(node) {
		super();
		this.nodes = [node];
		this.rect = new SRect();
	}

	static getCols(nodes, rect) {
		const cols = [];
		let col;
		nodes.forEach((b, i) => {
			if (i === 0) {
				col = new SCol(b);
				cols.push(col);
			} else {
				const a = nodes[i - 1];
				if (b.rect.left >= a.rect.right) {
					col = new SCol(b);
					cols.push(col);
				} else {
					col.nodes.push(b);
				}
			}
		});
		cols.forEach(col => col.setRect(rect));
		return cols;
	}

	setRect(parentRect) {
		this.parentRect = parentRect;
		this.rect.top = 0;
		this.rect.bottom = this.rect.height = parentRect.height;
		const bounds = SRect.fromNodes(this.nodes);
		this.rect.left = bounds.left;
		this.rect.right = bounds.right;
		this.rect.width = bounds.right - bounds.left;
		this.nodes.forEach(a => a.rect.move(-this.rect.left, -this.rect.top));
	}

	setParent(node) {
		const type = 'SCol';
		const name = 'col';
		this.type = type;
		this.name = name;
		this.fileName = name;
		this.className = name;
		this.tagName = SUtil.getTagName(name);
		this.groups = [];
		this.originalRect = this.rect;
		// this.parentRect = node.rect;
		// this.originalParentRect = node.rect;
		this.childOfSymbol = node.childOfSymbol;
		this.collectedStyles = node.collectedStyles;
		this.zIndex = 0;
		this.styleText = '';
		this.margin = new SRect();
		this.padding = new SRect();
		this.style = {};
		this.collectedNames = {};
		this.classes = [`col-${this.col}`];
		this.overrides = {};
		this.absolute = false;
		this.relative = true;
		Object.defineProperty(this, 'parent', {
			value: node,
			writable: true
		});
		Object.defineProperty(this, 'parentSymbol', {
			value: node.parentSymbol,
			writable: true
		});
	}

	getStyle() {
		const margin = this.margin;
		const padding = this.padding;
		let style = {};
		if (padding.top) {
			style.paddingTop = toPxx(padding.top);
		}
		if (padding.bottom) {
			style.paddingBottom = toPxx(padding.bottom);
		}
		if (padding.left) {
			style.paddingLeft = toPxx(padding.left);
		}
		if (padding.right) {
			style.paddingRight = toPxx(padding.right);
		}
		if (margin.top) {
			style.marginTop = toPx(margin.top);
		}
		if (margin.top) {
			style.marginBottom = toPx(margin.bottom);
		}
		return style;
	}

}
