/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SCol from './scol';
import SNode from './snode';
import SOptions from './soptions';
import SRect from './srect';
import SRow from './srow';
import SUtil, { toPx, toPxx } from './sutil';

export default class SContainer extends SNode {

	constructor(node) {
		super();
		const type = 'SContainer';
		const name = 'container';
		this.type = type;
		this.name = name;
		this.fileName = name;
		this.className = name;
		this.tagName = SUtil.getTagName(name);
		this.groups = [];
		this.rect = node.rect;
		this.originalRect = node.rect;
		this.parentRect = node.rect;
		this.originalParentRect = node.originalRect;
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
			value: node.parent,
			writable: true
		});
		Object.defineProperty(this, 'parentSymbol', {
			value: node.parent.type === 'MSSymbolInstance' ? node.parent : node.parent.parentSymbol,
			writable: true
		});
	}

	static parseNodes(node) {
		const layout = SOptions.layout;
		const rect = node.rect;
		let nodes = node.nodes;
		const shapes = node.shapes;
		const relatives = node.relatives;
		const absolutes = node.absolutes;
		nodes.forEach(a => a.setPosition2());
		relatives.forEach(x => x._rect = new SRect(x.rect));
		const innerRect = SRect.fromNodes(relatives);
		const isContainer = rect.width >= layout.totalWidth && innerRect.width < layout.totalWidth;
		const rows = SRow.getRows(relatives, rect);
		rows.forEach(row => {
			row.cols = SCol.getCols(row.nodes, row.rect);
			row.cols.forEach(col => {
				col.col = 0;
				col.colWidth = 0;
				if (isContainer) {
					const innerRect = SRect.fromNodes(col.nodes);
					/*
					const colName = layout.cols.reduce((x, width, i) => {
						return (Math.abs(width - innerRect.width) <= 1 ? (i + 1) : x);
					}, 0);
					*/
					const colName = layout.reverseCols.reduce((x, width, i) => {
						return innerRect.width < width ? (layout.reverseCols.length - 1 - i) : x;
					}, layout.numberOfColumns);
					if (colName > 0 && colName < layout.numberOfColumns + 1) {
						col.col = colName;
						col.colWidth = layout.cols[colName - 1];
					}
				}
			});
		});
		const numCols = rows.reduce((p, row) => p + row.cols.length, 0);
		const colSizes = rows.reduce((p, row) => p.concat(row.cols.map(col => col.col)), []);
		const colTotal = colSizes.reduce((p, num) => p + num, 0);
		const isGrid = isContainer && colTotal < layout.numberOfColumns; //  && (this.rows.length > 1 || (this.rows.find(r => r.cols.length > 1) !== undefined));
		const isVertical = !isContainer && rows.length > 1;
		const isHorizontal = !isContainer && rows.find(row => row.cols.length > 1) !== undefined;
		if (isGrid) {
			const container = new SContainer(node);
			container.zIndex = relatives.reduce((p, x) => Math.min(p, x.zIndex), Number.POSITIVE_INFINITY);
			rows.forEach(row => {
				row.setParent(container);
				const cols = row.cols;
				cols.forEach(col => {
					col.setParent(row);
					col.relatives = col.nodes;
				});
				row.relatives = cols;
				row.nodes = cols;
			});
			container.nodes = rows;
			container.relatives = rows;
			node.relatives = [container];
			nodes = [].concat(shapes, absolutes, [container]).sort((a, b) => a.zIndex - b.zIndex);
		} else {
			relatives.forEach(x => {
				x.rect = new SRect(x._rect);
				x.parent = node.parent;
			});
		}
		const parsed = {
			parentName: node.parent.name,
			isContainer,
			isGrid,
			isVertical,
			isHorizontal,
			numRows: rows.length,
			numCols: numCols,
			colSizes: colSizes,
			colTotal: colTotal,
			// nodes: [].concat(shapes, node.relatives, node.absolutes),
			nodes: nodes,
			shapes: shapes,
			relatives: node.relatives,
			absolutes: node.absolutes,
		};
		return parsed;
	}

	static sortRowCol(a, b) {
		const dy = (a.rect.top - b.rect.top);
		const dx = (a.rect.left - b.rect.left);
		if ((dy < 0 && b.rect.top >= a.rect.bottom) ||
			(dy > 0 && a.rect.top >= b.rect.bottom)) {
			return dy;
		} else {
			return dx;
		}
	}

	static reNode(a, b, childs) {
		if (childs.indexOf(b) === -1) {
			a.nodes.push(b);
			childs.push(b);
			b.rect.move(-a.rect.left, -a.rect.top);
			b.absolute = true;
			b.parentRect = a.rect;
			b.parent = a;
			b.parentSymbol = a.type === 'MSSymbolInstance' ? a : a.parentSymbol;
		}
	}

	static getNodes(nodes) {
		nodes = nodes.slice();
		if (nodes.length > 1) {
			const childs = [];
			nodes.filter(a => !a.absolute).forEach(a => {
				nodes.filter(b => !b.absolute).forEach(b => {
					if (a !== b && SRect.overlaps(a.rect, b.rect)) {
						if (a.rect.width * a.rect.height > b.rect.width * b.rect.height) {
							SContainer.reNode(a, b, childs);
						} else {
							SContainer.reNode(b, a, childs);
						}
					}
				});
			});
			nodes = nodes.filter(a => childs.indexOf(a) === -1);
		}
		return nodes;
	}

	getStyle() {
		const margin = this.margin;
		const padding = this.padding;
		let style = {};
		if (Math.abs(padding.bottom - padding.top) > 1) {
			if (padding.top) {
				style.paddingTop = toPxx(padding.top);
			}
			if (padding.bottom) {
				style.paddingBottom = toPxx(padding.bottom);
			}
		} else {
			style.alignItems = 'center';
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
