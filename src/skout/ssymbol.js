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

	render() {
		if (SOptions.component.export) {
			const nodes = this.renderNodes();
			let html = nodes.map(x => toHTML(x)).join('\n');
			if (!SOptions.inline) {
				const styles = new VNode('link', {
					rel: 'stylesheet',
					type: 'text/css',
					href: `${SOptions.css.folder}/grid.css`
				}, []);
				html = toHTML(styles) + html;
			}
			const tagName = `${this.className}-component`;
			SSymbol.collectedSymbols.push({
				className: this.className,
				componentName: SUtil.toComponentName(this.className),
				tagName: tagName,
				html: html,
				css: SStyle.stylesToCss(this.collectedStyles),
			});
			const attributes = this.attributes();
			return new VNode(tagName, attributes, []);
		} else {
			return SNode.prototype.render.call(this);
		}
	}

	static save(folder, object) {
		const path = `${SOptions.component.folder}/${object.className}`;
		const filePath = `${object.className}.component`;
		const css = object.css;
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
        return ['name'];
    }

}

window.customElements.define('${object.tagName}', ${object.componentName});
`);
		SUtil.saveTextFile(js, `${folder}/${path}`, `${filePath}.js`);
	}

}

SSymbol.collectedNames = {};
SSymbol.collectedSymbols = [];
