/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SNode from './snode';
import SOptions from './soptions';
import SStyle from './sstyle';

export default class SText extends SNode {

	constructor(node) {
		super(node);
		this.innerText = node.object.text;
		if (this.parentSymbol) {
			const overrides = this.parentSymbol.overrides;
			overrides[this.fileName] = this.innerText;
			// console.log(overrides);
		}
	}

	getStyle(...rest) {
		this.classes.push('stext');
		const style = SNode.prototype.getStyle.apply(this, rest);
		const alignItems = (typeof this.sketchObject.verticalAlignment == 'function') ? ['flex-start', 'center', 'flex-end'][this.sketchObject.verticalAlignment()] : 'flex-start';
		style.alignItems = alignItems;
		const sharedStyle = SStyle.getSharedStyle(this.object);
		const localStyle = SStyle.parseTextStyle(this.sketchObject);
		if (SOptions.inline) {
			if (sharedStyle) {
				Object.assign(style, sharedStyle.style);
			} else {
				Object.assign(style, localStyle);
			}
		} else {
			if (sharedStyle) {
				this.collectSharedStyle(sharedStyle);
			} else {
				Object.assign(style, localStyle);
			}
			this.collectStyle(style);
		}
		return style;
	}

	attributes() {
		const attributes = {
			className: this.classes.join(' '),
		};
		if (SOptions.inline) {
			attributes.style = this.style;
		}
		return attributes;
	}

	render() {
		return new VNode('div', this.attributes(), [
            new VNode('span', null, [
                new VText(this.innerText)
            ])
        ]);
	}

}
