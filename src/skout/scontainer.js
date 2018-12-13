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
		const shapes = node.shapes;
		const relatives = node.relatives;
		const absolutes = node.absolutes;
		let nodes = node.nodes;
		nodes.forEach(a => a.setPosition());
		relatives.forEach(x => x._rect = new SRect(x.rect));
		let rect = node.rect;
		const innerRect = SRect.fromNodes(relatives);
		const isContainer = rect.width >= layout.totalWidth && innerRect.width < layout.totalWidth;
		if (isContainer) {
			const containerWidth = layout.totalWidth + layout.gutterWidth;
			rect = new SRect(rect);
			rect.left = (rect.width - containerWidth) / 2;
			rect.width = containerWidth;
			rect.right = rect.left + rect.width;
			relatives.forEach(x => x.rect.move(-rect.left, 0));
			if (node.parent.name === 'section--signin') {
				console.log(node.parent.name);
			}
		}
		const rows = SRow.getRows(relatives, rect);
		rows.forEach(row => {
			row.cols = SCol.getCols(row.nodes, row.rect);
			let colOffset = 0;
			row.cols.forEach(col => {
				col.size = 0;
				if (isContainer) {
					const module = (layout.columnWidth + layout.gutterWidth);
					const offset = Math.floor(col.rect.left / module);
					const size = Math.ceil(col.rect.width / module);
					const width = Math.floor(size * module);
					colOffset = Math.max(offset, colOffset) - colOffset;
					if (size > 0 && size < layout.numberOfColumns + 1) {
						col.size = size;
						col.offset = colOffset;
						col.width = width;
					}
					colOffset += size;
					/*
					const innerRect = SRect.fromNodes(col.nodes);
					const colName = layout.reverseCols.reduce((x, width, i) => {
						return innerRect.width < width ? (layout.reverseCols.length - 1 - i) : x;
					}, layout.numberOfColumns);
					if (colName > 0 && colName < layout.numberOfColumns + 1) {
						col.size = colName;
						col.width = layout.cols[colName - 1];
						colOffset += colName;
					}
					*/
				}
			});
		});
		const numCols = rows.reduce((p, row) => p + row.cols.length, 0);
		const colSizes = rows.reduce((p, row) => p.concat(row.cols.map(col => col.size)), []);
		const colTotal = colSizes.reduce((p, num) => p + num, 0);
		const isGrid = rows.reduce((p, row) => {
			const totals = row.cols.reduce((p, col) => p + col.size + col.offset, 0);
			if (node.parent.name === 'section--signin') {
				console.log('totals', totals);
			}
			return p && (totals <= layout.numberOfColumns);
		}, isContainer);
		if (node.parent.name === 'section--signin') {
			console.log('isGrid', isGrid, rows.length);
		}
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
			if (isContainer) {
				const container = new SContainer(node);
				container.zIndex = relatives.reduce((p, x) => Math.min(p, x.zIndex), Number.POSITIVE_INFINITY);
				container.nodes = relatives;
				container.relatives = relatives;
				node.relatives = [container];
				nodes = [].concat(shapes, absolutes, [container]).sort((a, b) => a.zIndex - b.zIndex);

			}
		}
		const parsed = {
			parentName: node.parent.name,
			isContainer,
			isGrid,
			isVertical,
			isHorizontal,
			numRows: rows.length,
			numCols: numCols,
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

	getUniqueClassName(parentCollectedNames) {
		return this.fileName;
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
		if (Math.abs(padding.bottom - padding.top) <= 1) {
			style.alignItems = 'center';
		}
		/*
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
		*/
		if (margin.top) {
			style.marginTop = toPx(margin.top);
		}
		if (margin.top) {
			style.marginBottom = toPx(margin.bottom);
		}
		return style;
	}

}
