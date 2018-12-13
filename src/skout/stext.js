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
import SLayer from './slayer';
import SOptions from './soptions';
import SStyle from './sstyle';

export default class SText extends SLayer {

	constructor(node) {
		super(node);
		this.innerText = node.object.text;
		if (this.parentSymbol) {
			const overrides = this.parentSymbol.overrides;
			overrides[this.fileName] = this.innerText;
			// console.log(overrides);
		}
	}

	/****************
	STYLE
	*****************/

	getInput() {
		if (this.tagName === 'placeholder' || this.tagName === 'value') {
			return this.parent.nodes.find(x => x.tagName === 'input');
		}
	}

	collectSharedStyle(sharedStyle) {
		if (SOptions.component.export) {
			this.collectedStyles.push(sharedStyle);
		} else {
			const collected = SStyle.collectedTextStyles.find(x => x.className == sharedStyle.className);
			if (!collected) {
				SStyle.collectedTextStyles.push(sharedStyle);
			}
		}
		this.classes.push(sharedStyle.className);
	}

	getStyle(...rest) {
		this.classes.push('stext');
		const style = SLayer.prototype.getStyle.apply(this, rest);
		const alignItems = (typeof this.sketchObject.verticalAlignment == 'function') ? ['flex-start', 'center', 'flex-end'][this.sketchObject.verticalAlignment()] : 'flex-start';
		style.alignItems = alignItems;
		const sharedStyle = SStyle.getSharedStyle(this.object);
		if (sharedStyle) {
			const input = this.getInput();
			if (input) {
				sharedStyle.className = ''; // 'input::placeholder';
				sharedStyle.selector = '.' + input.uniqueClassName; // 'input::placeholder';
			}
		}
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

	/****************
	RENDER
	*****************/

	attributes() {
		const attributes = {
			className: this.classes.join(' '),
		};
		if (SOptions.inline) {
			attributes.style = this.style;
		}
		return attributes;
	}

	isInputPlaceholder() {
		/*
		if (this.tagName == 'placeholder') {
			console.log(this.parent.name, this.parent.nodes.map(x => x.tagName));
		}
		*/
		return this.tagName === 'placeholder' && this.parent.nodes.find(x => x.tagName === 'input') !== undefined;
	}

	render() {
		const lines = this.innerText.split('\n');
		return new VNode('div', this.attributes(), this.isInputPlaceholder() ? [] : [
			new VNode('div', null,
				lines.length > 1 ?
				lines.map(x => {
					return x === '' ?
						new VNode('br') :
						new VNode('p', null, [
							new VText(x)
						]);
				}) :
				lines.map(x => new VText(x))
			)
        ]);
	}

}
