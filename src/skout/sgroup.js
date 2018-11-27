/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SRect from './srect';

export default class SGroup {

	constructor() {
		this.nodes = [];
		this.rect = new SRect();
		this.bounds = new SRect();
	}

	static newWithNode(node) {
		const group = new SGroup();
		group.nodes.push(node);
		return group;
	}

	static getBounds(nodes) {
		const bounds = nodes.reduce((bounds, a) => {
			return {
				left: Math.min(a.rect.left, bounds.left),
				top: Math.min(a.rect.top, bounds.top),
				right: Math.max(a.rect.right, bounds.right),
				bottom: Math.max(a.rect.bottom, bounds.bottom),
			};
		}, {
			left: Number.POSITIVE_INFINITY,
			top: Number.POSITIVE_INFINITY,
			right: Number.NEGATIVE_INFINITY,
			bottom: Number.NEGATIVE_INFINITY
		});
		return bounds;
	}

	setRowRect(parentRect) {
		this.rect.left = 0;
		this.rect.right = this.rect.width = parentRect.width;
		const bounds = SGroup.getBounds(this.nodes);
		this.rect.top = bounds.top;
		this.rect.bottom = bounds.bottom;
		this.rect.height = bounds.bottom - bounds.top;
		this.nodes.forEach(a => a.rect.move(-this.rect.left, -this.rect.top));
	}

	setColRect(parentRect) {
		this.rect.top = 0;
		this.rect.bottom = this.rect.height = parentRect.height;
		const bounds = SGroup.getBounds(this.nodes);
		this.rect.left = bounds.left;
		this.rect.right = bounds.right;
		this.rect.width = bounds.right - bounds.left;
		this.nodes.forEach(a => a.rect.move(-this.rect.left, -this.rect.top));
	}

}
