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

export default class SRow extends SNode {

	constructor(node) {
		super();
		this.nodes = [node];
		this.rect = new SRect();
	}

	static getRows(nodes, rect) {
		const rows = [];
		let row;
		nodes.forEach((b, i) => {
			if (i === 0) {
				row = new SRow(b);
				row.i = rows.length;
				rows.push(row);
			} else {
				const a = nodes[i - 1];
				if (b.rect.top >= a.rect.bottom) {
					row = new SRow(b);
					row.i = rows.length;
					rows.push(row);
				} else {
					row.nodes.push(b);
				}
			}
		});
		rows.forEach(row => row.setRect(rect));
		return rows;
	}

	getUniqueClassName(parentCollectedNames) {
		return this.fileName;
	}

	getUniqueStyleName() {
		return `${this.uniqueClassName}:nth-child(${this.i + 1})`;
	}

	setRect(parentRect) {
		this.parentRect = parentRect;
		this.rect.left = 0;
		this.rect.right = this.rect.width = parentRect.width;
		const bounds = SRect.fromNodes(this.nodes);
		this.rect.top = bounds.top;
		this.rect.bottom = bounds.bottom;
		this.rect.height = bounds.bottom - bounds.top;
		this.nodes.forEach(a => a.rect.move(-this.rect.left, -this.rect.top));
	}

	setParent(node) {
		const type = 'SRow';
		const name = 'row';
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
		this.classes = [];
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
		/*
		if (Math.abs(padding.right - padding.left) <= 1) {
			style.justifyContent = 'center';
		}
		*/
		if (margin.top) {
			style.marginTop = toPx(margin.top);
		}
		if (margin.bottom) {
			style.marginBottom = toPx(margin.bottom);
		}
		return style;
	}

}
