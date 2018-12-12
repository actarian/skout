/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SRect from "./srect";

const SLayoutWidthDefault = 1280;
const SLayoutHeightDefault = 720;

const SLayoutDefault = {
	maxWidth: SLayoutWidthDefault,
	maxHeight: SLayoutHeightDefault,
	totalWidth: SLayoutWidthDefault,
	numberOfColumns: 1,
	columnWidth: SLayoutWidthDefault,
	gutterWidth: 0,
	cols: [SLayoutWidthDefault],
	reverseCols: [SLayoutWidthDefault],
	rect: new SRect(0, 0, SLayoutWidthDefault, SLayoutHeightDefault),
};

export default class SLayout {

	constructor(layout) {
		Object.assign(this, SLayoutDefault);
		if (layout) {
			Object.assign(this, layout);
		}
	}

	static fromRect(rect) {
		const width = parseInt(rect.width);
		const height = parseInt(rect.height);
		return new SLayout({
			maxWidth: width,
			maxHeight: height,
			totalWidth: width,
			numberOfColumns: 1,
			columnWidth: width,
			gutterWidth: 0,
			cols: [width],
			reverseCols: [width],
			rect: rect,
		});
	}

	static fromArtboard(artboard) {
		const rect = SRect.fromCGSize(artboard.frame().rect().size);
		const layout = SLayout.fromRect(rect);
		const artboardLayout = artboard.layout();
		if (artboardLayout) {
			const totalWidth = artboardLayout.totalWidth();
			const numberOfColumns = artboardLayout.numberOfColumns();
			const columnWidth = artboardLayout.columnWidth();
			const gutterWidth = artboardLayout.gutterWidth();
			layout.totalWidth = totalWidth;
			layout.numberOfColumns = numberOfColumns;
			layout.columnWidth = columnWidth;
			layout.gutterWidth = gutterWidth;
			layout.cols = Array.apply(null, Array(numberOfColumns)).map((x, i) => Math.min(totalWidth, Math.floor((columnWidth + gutterWidth) * (i + 1) - gutterWidth)));
			layout.reverseCols = layout.cols.slice().reverse();
		}
		return layout;
	}

}
