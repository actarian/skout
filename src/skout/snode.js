/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import VNode from 'virtual-dom/vnode/vnode';
import SOptions from './soptions';
import SRect from './srect';
import SStyle from './sstyle';
import { toPx, toPxx } from './sutil';

const StyleShapes = ['MSRectangleShape', 'MSOvalShape'];

export default class SNode {

	constructor() {
		this.rotation = 0;
		this.relatives = [];
		this.absolutes = [];
		this.shapes = [];
	}

	static log(node) {
		console.log(node.uniqueClassName, ' '.repeat(50 - node.uniqueClassName.length), (node.absolute ? 'abs' : 'rel'), node.rect.width, 'x', node.rect.height);
		node.nodes.forEach((a, i) => {
			console.log(node.uniqueClassName, '=>', a.uniqueClassName, ' '.repeat(50 - node.uniqueClassName.length - 4 - a.uniqueClassName.length), (a.absolute ? 'abs' : 'rel'), a.rect.width, 'x', a.rect.height);
		});
		console.log(' ', ' ');
	}

	/****************
	MARGIN PADDING
	*****************/

	setMarginAndPaddings() {
		let innerRect = SRect.fromNodes(this.relatives);
		const rect = this.rect;
		const padding = this.padding;
		padding.top = innerRect.top;
		padding.right = rect.width - innerRect.right;
		padding.bottom = rect.height - innerRect.bottom;
		padding.left = innerRect.left;
		if (this.isHorizontal) {
			this.relatives.forEach((b, i) => {
				if (i > 0) {
					const a = this.relatives[i - 1];
					a.margin.right = b.rect.left - a.rect.right;
				}
			});
		} else if (this.isVertical) {
			this.relatives.forEach((b, i) => {
				if (i > 0) {
					const a = this.relatives[i - 1];
					a.margin.bottom = b.rect.top - a.rect.bottom;
				}
			});
		}
		this.nodes.forEach(a => a.setMarginAndPaddings());
	}

	/****************
	PATHNAMES
	*****************/

	/*
	getPlaceholderInput() {
		if (this.tagName === 'placeholder') {
			return this.parent.nodes.find(x => x.tagName === 'input');
		}
	}
	*/

	getUniqueClassName(parentCollectedNames) {
		const fileName = this.fileName;
		let count = 0;
		count = parentCollectedNames[fileName] || 0;
		count++;
		parentCollectedNames[fileName] = count;
		return fileName + (count > 1 ? '-' + count : '');
	}

	getUniqueStyleName() {
		return this.uniqueClassName;
	}

	setPathNames(parentClassName = '', parentPathNames = [], parentCollectedNames = {}, parentType = 'Root') {
		let pathNames = [];
		if (parentType == 'MSSymbolInstance') {
			pathNames = [parentClassName];
		} else if (Array.isArray(parentPathNames)) {
			pathNames = parentPathNames.slice();
		}
		const uniqueClassName = this.getUniqueClassName(parentCollectedNames);
		this.uniqueClassName = uniqueClassName;
		/*
		const placeholderInput = this.getPlaceholderInput();
		if (placeholderInput) {
			const className = `${placeholderInput.uniqueClassName}::placeholder`;
			pathNames.push(className);
		} else {
			pathNames.push(uniqueClassName);
		}
		console.log('uniqueClassName', uniqueClassName);
		*/
		const uniqueStyleName = this.getUniqueStyleName();
		pathNames.push(uniqueStyleName);
		this.parentType = parentType;
		this.classes.push(uniqueClassName);
		this.pathNames = pathNames;
		this.collectedNames = [];
		this.nodes.forEach((a, i) => {
			a.setPathNames(uniqueStyleName, this.pathNames, this.collectedNames, this.type);
		});
	}

	/****************
	STYLE
	*****************/

	isShape() {
		return StyleShapes.indexOf(this.type) !== -1;
	}

	getStyle() {
		const rect = this.rect;
		const parentRect = this.parentRect;
		const margin = this.margin;
		const padding = this.padding;
		let style = {};
		if (SOptions.html.relative) {
			style = {
				position: this.absolute ? 'absolute' : 'relative',
				width: '100%',
				zIndex: this.zIndex,
			};
			if (this.absolute) {
				style.top = toPx(rect.top);
				style.left = toPx(rect.left);
				style.height = toPxx(rect.height);
				if (!this.isShape()) {
					style.maxWidth = toPxx(rect.width);
				}
			} else if (this.parent.isGrid) {
				style.minHeight = toPxx(rect.height);
			} else if (this.parent.isContainer) {
				style.maxWidth = toPxx(rect.width);
				if (this.type !== 'MSTextLayer') {
					style.minHeight = toPxx(rect.height);
				}
			} else {
				if (rect.width < parentRect.width) {
					style.maxWidth = toPxx(rect.width);
				}
				if (this.type !== 'MSTextLayer') {
					style.minHeight = toPxx(rect.height);
				}
			}
			if (this.isHorizontal) {
				style.display = 'flex';
				style.flexDirection = 'row';
				style.justifyContent = 'space-between';
				style.alignItems = 'center';
				style.flexWrap = 'wrap';
			}
			if (this.isVertical) {
				style.display = 'block';
				style.flexDirection = 'column';
			}
			if (!this.parent.isHorizontal) {
				if (margin.top) {
					style.marginTop = toPx(margin.top);
				}
				if (margin.right) {
					style.marginRight = toPx(margin.right);
				}
				if (margin.bottom) {
					style.marginBottom = toPx(margin.bottom);
				}
				if (margin.left) {
					style.marginLeft = toPx(margin.left);
				}
			}
			if (this.nodes.length) {
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
				if (padding.top < 120 || Math.abs(padding.bottom - padding.top) > 1) {
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
				if (padding.left < 120 || Math.abs(padding.right - padding.left) > 1) {
					if (padding.left) {
						style.paddingLeft = toPxx(padding.left);
					}
					if (padding.right) {
						style.paddingRight = toPxx(padding.right);
					}
				} else {
					style.justifyContent = 'center';
				}
			}
			/*
			const placeholder = this.getInputPlaceholder();
			if (placeholder) {
				const innerRect = placeholder.rect;
				style.paddingTop = toPxx(innerRect.top);
				style.paddingRight = toPxx(rect.width - innerRect.right);
				style.paddingBottom = toPxx(rect.height - innerRect.bottom);
				style.paddingLeft = toPxx(innerRect.left);
			}
			*/
		} else if (SOptions.html.exact) {
			style = {
				position: 'absolute',
				top: toPx(rect.top),
				left: toPx(rect.left),
				width: toPxx(rect.width),
				height: toPxx(rect.height),
				zIndex: this.zIndex,
			};
		} else {
			style = {
				position: 'absolute',
				top: this.constraint.top ? toPx(rect.top) : (rect.top / parentRect.height * 100).toFixed(2) + '%',
				left: this.constraint.left ? toPx(rect.left) : (rect.left / parentRect.width * 100).toFixed(2) + '%',
				zIndex: this.zIndex,
			};
			if (this.constraint.right) {
				style.right = toPx(parentRect.width - rect.right);
			}
			if (this.constraint.bottom) {
				style.bottom = toPx(parentRect.height - rect.bottom);
			}
			if (this.constraint.left && this.constraint.right) {
				style.width = 'auto';
			} else {
				style.width = this.constraint.width ? toPxx(rect.width) : (rect.width / parentRect.width * 100).toFixed(2) + '%';
			}
			if (this.constraint.top && this.constraint.bottom) {
				style.width = 'auto';
			} else {
				style.height = this.constraint.height ? toPxx(rect.height) : (rect.height / parentRect.height * 100).toFixed(2) + '%';
			}
		}
		if (this.rotation) {
			style.transform = `rotateZ(${-this.rotation}deg)`;
		}
		if (this.backgroundColor) {
			style.backgroundColor = this.backgroundColor;
		}
		if (this.type === 'MSTextLayer') {
			if (this.textShadow) {
				style.textShadow = this.textShadow;
			}
		} else {
			if (this.boxShadow) {
				style.boxShadow = this.boxShadow;
			}
		}
		return style;
	}

	isShapeForRect(rect) {
		return this.tagName !== 'input' && this.zIndex === 0 && StyleShapes.indexOf(this.type) !== -1 && SRect.equals(rect, this.rect);
	}

	setStyle() {
		this.style = this.getStyle();
		const shape = this.nodes.find(x => x.isShapeForRect(this.rect));
		if (shape) {
			const shapeStyle = SStyle.parseStyle(shape);
			Object.assign(this.style, shapeStyle);
		}
		this.nodes.forEach(x => x.setStyle());
	}

	/****************
	RENDER
	*****************/

	getInputPlaceholder() {
		if (this.tagName === 'input') {
			return this.parent.nodes.find(x => x.tagName === 'placeholder');
		}
	}

	collectStyle(style) {
		let selector = SOptions.component.export ?
			this.pathNames.map((x, i) => {
				return i === 0 ? (this.childOfSymbol ? ':host' : '.' + x) : x;
			}).join(' > .') :
			'.' + this.pathNames.join(' > .');
		const styleObj = {
			className: this.getUniqueStyleName(),
			selector: selector,
			style: style,
		};
		if (this.type == 'MSSymbolInstance') {
			this.parent.collectedStyles.push(styleObj);
		} else {
			this.collectedStyles.push(styleObj);
		}
		if (this.childOfSymbol) {
			SStyle.collectedComponentStyles.push(styleObj);
		} else {
			SStyle.collectedStyles.push(styleObj);
		}
	}

	attributes() {
		const attributes = {
			className: this.classes.join(' '),
		};
		switch (this.tagName) {
			case 'button':
				attributes.type = 'button';
				break;
			case 'input':
				attributes.type = 'text';
				const placeholder = this.getInputPlaceholder();
				if (placeholder) {
					attributes.placeholder = placeholder.innerText;
					// attributes.value = placeholder.innerText;
				}
				break;
		}
		const style = this.style;
		if (SOptions.inline) {
			attributes.style = style;
		} else {
			this.collectStyle(style);
		}
		return attributes;
	}

	renderNodes() {
		return this.nodes.filter(x => this.shapes.indexOf(x) === -1).map(x => x.render());
	}

	render() {
		return new VNode(this.tagName, this.attributes(), this.renderNodes());
	}

}
