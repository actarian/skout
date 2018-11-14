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

	constructor(node) {
		super(node);
		this.symbolId = node.symbolId;
		const names = SSymbol.getNames(node.name, node.symbolId);
		this.tagName = names.fileName;
		this.originalSymbolId = node.originalSymbolId;
		const originalNames = SSymbol.getNames(node.originalName, node.originalSymbolId);
		this.originalName = originalNames.name;
		this.originalTagName = originalNames.fileName;
		this.fileName = originalNames.fileName;
		if (this.parentSymbol) {
			const overrides = this.parentSymbol.overrides;
			overrides[this.originalTagName] = this.tagName;
			// console.log(overrides);
			// console.log(this.tagName, this.originalTagName);
		}
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
			const tagName = `${this.tagName}-component`;
			const collected = SSymbol.collectedSymbols.find(x => x.tagName == tagName);
			if (!collected) {
				SSymbol.collectedSymbols.push({
					pathName: this.tagName,
					componentName: SUtil.toComponentName(this.tagName),
					tagName: tagName,
					overrides: this.overrides,
					html: html,
					css: SStyle.stylesToCss(this.collectedStyles),
				});
			}
			// this.classes.push(`outlet-${this.originalTagName}`);
			const attributes = this.attributes();
			attributes.data = JSON.stringify(this.overrides);
			const componentName = `${this.originalTagName}-component`;
			/*
			if (this.parentSymbol) {
				this.parentSymbol.overrides[componentName] = tagName;
			}
			console.log(this.name, this.originalName, this.overrides);
			*/
			return new VNode(componentName, attributes, []);
		} else {
			return SNode.prototype.render.call(this);
		}
	}

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

class ${object.componentName} extends Component {

${getters}

    static get observedAttributes() {
        return ['data']; // ${JSON.stringify(Object.keys(object.overrides)).replace(/"/gm, `'`)};
    }

}

window.customElements.define('${object.tagName}', ${object.componentName});
`);
		SUtil.saveTextFile(js, `${folder}/${path}`, `${filePath}.js`);
	}

}

SSymbol.collectedIds = {};
SSymbol.collectedNames = {};
SSymbol.collectedSymbols = [];
