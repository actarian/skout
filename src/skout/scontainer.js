/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SGroup from './sgroup';
import SRect from './srect';

export default class SContainer {

	constructor(nodes, rect) {
		nodes = SContainer.getNodes(nodes);
		nodes = nodes.slice().sort(SContainer.sortRowCol);
		// console.log(nodes.map(x => x.i).join(', '));
		const rows = SContainer.getRows(nodes, rect);
		// console.log('rows', rows.map(x => x.nodes.length).join(', '));
		rows.forEach(r => {
			r.cols = SContainer.getCols(r.nodes, r.rect);
		});
		// console.log('cols', rows.map(x => x.cols.length).join(', '));
		this.nodes = nodes;
		this.rows = rows;
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

	static getRows(nodes, rect) {
		const rows = [];
		let row;
		nodes.filter(n => !n.absolute).forEach((b, i) => {
			if (i === 0) {
				row = SGroup.newWithNode(b);
				rows.push(row);
			} else {
				const a = nodes[i - 1];
				if (b.rect.top >= a.rect.bottom) {
					row = SGroup.newWithNode(b);
					rows.push(row);
				} else {
					row.nodes.push(b);
				}
			}
		});
		rows.forEach(r => r.setRowRect(rect));
		return rows;
	}

	static getCols(nodes, rect) {
		const cols = [];
		let col;
		nodes.forEach((b, i) => {
			if (i === 0) {
				col = SGroup.newWithNode(b);
				cols.push(col);
			} else {
				const a = nodes[i - 1];
				if (b.rect.left >= a.rect.right) {
					col = SGroup.newWithNode(b);
					cols.push(col);
				} else {
					col.nodes.push(b);
				}
			}
		});
		cols.forEach(c => c.setColRect(rect));
		return cols;
	}

	static getNodes(nodes) {
		if (nodes.length > 1) {
			const absolutes = [];
			nodes = nodes.slice();
			nodes.forEach(a => {
				nodes.forEach(b => {
					if (a !== b && SRect.overlaps(a.rect, b.rect)) {
						if (a.rect.width * a.rect.height > b.rect.width * b.rect.height) {
							a.nodes.push(b);
							absolutes.push(b);
							b.rect.move(-a.rect.left, -a.rect.top);
							b.absolute = true;
						} else {
							b.nodes.push(a);
							absolutes.push(a);
							a.rect.move(-b.rect.left, -b.rect.top);
							a.absolute = true;
						}
					}
				});
			});
			nodes = nodes.filter(a => absolutes.indexOf(a) === -1);
			return nodes;
		} else {
			return nodes.slice();
		}
	}

	render() {
		return this.rows.map(r => {
			const cols = r.cols.map(c => {
				const nodes = c.nodes.forEach(n => n.render());
				return new VNode('div', {
					className: 'col'
				}, nodes);
			});
			return new VNode('div', {
				className: 'row'
			}, cols);
		});
	}

}
