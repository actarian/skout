/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import toHTML from 'vdom-to-html';
import VNode from 'virtual-dom/vnode/vnode';
import SNode from './snode';
import SOptions from './soptions';
import SStyle from './sstyle';
import SUtil from './sutil';

export default class SSymbol extends SNode {

	/*
	static getNames(text, id) {
		const groups = SUtil.toGroupNames(text);
		const name = groups.pop();
		let fileName = SSymbol.collectedIds[id];
		if (!fileName) {
			fileName = SUtil.getFileName(name);
			fileName += SSymbol.getSymbolNameCount(fileName);
			SSymbol.collectedIds[id] = fileName;
		}
		return { groups, name, fileName };
	}

	static getSymbolNameCount(text) {
		let count = SSymbol.collectedNames[text] || 0;
		count++;
		SSymbol.collectedNames[text] = count;
		return count > 1 ? '-' + count : '';
	}
	*/

	static save(folder, object) {
		const path = `${SOptions.component.folder}/${object.pathName}`;
		const filePath = `${object.pathName}.component`;
		const css = SUtil.beautifyCss(object.css);
		const html = SUtil.beautifyHtml(object.html);
		if (SOptions.component.extract) {
			SUtil.saveTextFile(css, `${folder}/${path}`, `${filePath}.css`);
			SUtil.saveTextFile(html, `${folder}/${path}`, `${filePath}.html`);
		}
		let getters = SOptions.component.extract ? `static get styleUrl() {
			return '${path}/${filePath}.css';
		}

		static get templateUrl() {
			return '${path}/${filePath}.html';
		}` : `static get style() {
        return \`
${css}\`;
    }

    static get template() {
        return \`
${html}\`;
    }`;
		const js = SUtil.beautifyJs(`
/* jshint esversion: 6 */

import Component from '../component.js';

class ${object.componentClassName} extends Component {

${getters}

    static get observedAttributes() {
        return ['data'];
    }

}

window.customElements.define('${object.componentTagName}', ${object.componentClassName});
`);
		// ${JSON.stringify(Object.keys(object.overrides)).replace(/"/gm, `'`)};
		SUtil.saveTextFile(js, `${folder}/${path}`, `${filePath}.js`);
	}

	constructor(node) {
		super(node);
		/*
		this.symbolId = node.symbolId;
		const names = SSymbol.getNames(node.name, node.symbolId);
		this.name = names.name;
		this.fileName = names.fileName;
		this.className = names.className;
		this.tagName = names.fileName;
		this.componentClassName = names.componentClassName;
		this.componentTagName = names.componentTagName;
		*/
		this.originalSymbolId = node.originalSymbolId;
		const names = SUtil.getNames(node.originalName, node.originalSymbolId);
		this.originalName = names.name;
		this.originalFileName = names.fileName;
		this.originalClassName = names.className;
		this.originalTagName = names.fileName;
		this.originalComponentClassName = names.componentClassName;
		this.originalComponentTagName = names.componentTagName;
		this.fileName = names.fileName; // ???
		if (this.parentSymbol) {
			const overrides = this.parentSymbol.overrides;
			overrides[this.originalClassName] = this.className;
		}
	}

	getStyle(...rest) {
		this.classes.push('scomponent');
		const style = SNode.prototype.getStyle.apply(this, rest);
		return style;
	}

	render() {
		if (SOptions.component.export) {
			const nodes = this.renderNodes();
			let html = nodes.map(x => toHTML(x)).join('\n');
			if (!SOptions.inline) {
				const styles = new VNode('link', {
					rel: 'stylesheet',
					type: 'text/css',
					href: `${SOptions.css.folder}/shared.css`
				}, []);
				html = toHTML(styles) + html;
			}
			const collected = SSymbol.collectedSymbols.find(x => x.componentTagName == this.componentTagName);
			if (!collected) {
				SSymbol.collectedSymbols.push({
					pathName: this.className,
					componentClassName: this.componentClassName, // SUtil.toComponentName(this.className),
					componentTagName: this.componentTagName,
					// overrides: this.overrides,
					html: html,
					css: SStyle.stylesToCss(this.collectedStyles),
				});
			}
			this.overrides.scomponent = this.className;
			this.parentSymbol.overrides[this.uniqueClassName] = this.overrides;
			// console.log(this.overrides);
			const attributes = this.attributes();
			attributes.data = JSON.stringify(this.overrides);
			return new VNode(this.originalComponentTagName, attributes, []);
			// this.classes.push(`outlet-${this.originalTagName}`);
			/*
			console.log(this.name, this.originalName, this.overrides);
			*/
		} else {
			return SNode.prototype.render.call(this);
		}
	}

}

SSymbol.overrides = {};
SSymbol.collectedSymbols = [];
