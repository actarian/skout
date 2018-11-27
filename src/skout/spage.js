/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import Artboard from 'sketch/dom';
import toHTML from 'vdom-to-html';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SImage from './simage';
import SLayout from './slayout';
import SNode from './snode';
import SOptions from './soptions';
import SRect from './srect';
import SShape from './sshape';
import SStyle from './sstyle';
import SSvg from './ssvg';
import SSymbol from './ssymbol';
import SText from './stext';
import SUtil from './sutil';

export default class SPage extends SNode {

	static getNode(object, parent, parentData, childOfSymbol) {
		parentData = parentData || {};
		const name = object.name;
		const originalName = name;
		const type = String(object.sketchObject.className());
		const data = parentData[object.id];
		const rect = SRect.fromObject(object);
		let originalRect = new SRect(rect);
		let layers = object.layers || [];
		let collectedStyles = parent.collectedStyles;
		let node = {
			name,
			originalName,
			type,
			object,
			parent,
			rect,
			originalRect,
			childOfSymbol,
			collectedStyles,
		};
		/*
		MSArtboardGroup
		MSSymbolInstance
		MSLayerGroup
		MSRectangleShape
		MSOvalShape
		MSShapeGroup
		MSShapePathLayer
		MSBitmapLayer
		MSTextLayer
		*/
		switch (type) {
			case 'MSArtboardGroup':
				node = new SPage(node);
				node.parentSymbol = { overrides: SSymbol.overrides };
				break;
			case 'MSSymbolInstance':
				let symbolId = object.symbolId;
				const originalSymbolId = symbolId;
				if (data && data.symbolID && data.symbolID.trim() !== '') {
					symbolId = data.symbolID;
				}
				const symbol = SUtil.getDocument().getSymbolMasterWithID(symbolId);
				node.name = symbol.name;
				node.symbolId = symbolId;
				node.originalSymbolId = originalSymbolId;
				layers = symbol.layers || [];
				// object.layers = layers;
				//
				node = new SSymbol(node);
				node.collectedStyles = [];
				childOfSymbol = true;
				//
				originalRect = SRect.fromObject(symbol);
				node.originalRect = originalRect;
				parentData = {};
				const overrides = object.sketchObject.overrides();
				if (overrides) {
					Object.keys(overrides).forEach(x => {
						parentData[x] = overrides[x];
					});
				}
				if (typeof data == 'object') {
					Object.keys(data).forEach(x => {
						parentData[x] = data[x];
					});
				}
				node.parentData = parentData;
				break;
			case 'MSLayerGroup':
				if (SSvg.isSvg(object)) {
					node = new SSvg(node);
					layers = [];
				} else {
					node = new SNode(node);
				}
				break;
			case 'MSShapeGroup':
			case 'MSShapePathLayer':
				node = new SSvg(node);
				layers = [];
				break;
			case 'MSRectangleShape':
			case 'MSOvalShape':
				node = new SShape(node);
				break;
			case 'MSTextLayer':
				node = new SText(node);
				if (data) {
					node.innerText = data;
					if (node.parentSymbol) {
						const overrides = node.parentSymbol.overrides;
						overrides[node.fileName] = String(data);
					}
				}
				break;
			case 'MSBitmapLayer':
				node = new SImage(node);
				break;
			default:
				node = new SNode(node);
		}
		node.setConstraint();
		if (layers) {
			layers = layers.filter(x => (
				!x.hidden
			));
			layers = layers.map((layer, i) => {
				const snode = SPage.getNode(layer, node, parentData, childOfSymbol);
				snode.zIndex = i;
				snode.parentRect = node.rect;
				snode.originalParentRect = originalRect;
				return snode;
			});
			node.nodes = layers;
			/*
			if (node.name == 'home-hero') {
			    console.log(node.nodes.map(x => x.name).join(', '));
			}
			*/
			if (SOptions.html.relative) {
				node.setPosition();
				node.setContainer();
			}
		} else {
			node.nodes = [];
			if (SOptions.html.relative) {
				node.innerRect = node.rect;
			}
		}
		return node;
	}

	static fromArtboard(object) {
		const artboard = Artboard.fromNative(object);
		// MSDocument.currentDocument().documentData().allLayerStyles();
		// context.document.documentData().allLayerStyles();
		// MSDocument.currentDocument().documentData().allTextStyles();
		// context.document.documentData().allTextStyles();
		SUtil.collectedSymbolIds = {};
		SUtil.collectedSymbolNames = {};
		SSymbol.overrides = {};
		SStyle.collectedColors = {};
		SStyle.collectedFonts = {};
		SStyle.collectedStyles = [];
		SStyle.collectedComponentStyles = [];
		SStyle.collectedTextStyles = [];
		SImage.collectedImages = [];
		SSvg.collectedSvgs = [];
		const layout = SLayout.fromArtboard(object);
		SOptions.layout = layout;
		const page = SPage.getNode(artboard, {
			rect: layout.rect,
			originalRect: layout.rect,
			collectedStyles: []
		});
		page.zIndex = 0;
		page.parentRect = layout.rect;
		page.originalRect = layout.rect;
		if (SOptions.html.relative) {
			page.setMarginAndPaddings();
		}
		page.setPathNames();
		page.setStyle();
		return page;
	}

	render() {
		const node = SNode.prototype.render.call(this);
		// const nodes = this.renderNodes();
		const css = SStyle.getCss();
		SPage.css = css;
		// SPage.collectedStyles = this.getCss();
		const headNodes = [
            new VNode('base', {
				href: '.'
			}, []),
            new VNode('link', {
				rel: 'icon',
				type: 'image/x-icon',
				href: 'favicon.ico'
			}, []),
        ];
		if (SOptions.css.export) {
			headNodes.push(new VNode('link', {
				rel: 'stylesheet',
				type: 'text/css',
				href: `${SOptions.css.folder}/styles.css`
			}, []));
			/*
			Object.keys(css.styles).forEach(s => {
				if (css.styles[s].trim() !== '') {
					headNodes.push(new VNode('link', {
						rel: 'stylesheet',
						type: 'text/css',
						href: `${SOptions.css.folder}/${s}.css`
					}, []));
				}
			});
			*/
			/*
			headNodes.push(new VNode('link', {
			    rel: 'stylesheet',
			    type: 'text/css',
			    href: SOptions.css.folder + '/style.css'
			}, []));
			*/
		} else {
			if (css.style.trim() !== '') {
				headNodes.push(new VNode('style', null, [
                new VText(css.style)
			]));
			}
		}
		if (SOptions.component.export) {
			SSymbol.collectedSymbols.forEach(x => headNodes.push(new VNode('script', {
				src: `${SOptions.component.folder}/${x.pathName}/${x.pathName}.component.js`,
				type: 'module',
			}, [])));
		}
		return new VNode('html', null, [
            new VNode('head', null, headNodes),
            new VNode('body', null, [
				node,
                // new VNode('div', this.attributes(), nodes),
                new VText('##svg-sprite##')
            ])
        ]);
	}

	getHtml() {
		const html = toHTML(this.render());
		console.log('collectedImages', SImage.collectedImages.length);
		console.log('collectedSvgs', SSvg.collectedSvgs.length);
		console.log('collectedStyles', SStyle.collectedStyles.length);
		console.log('collectedComponentStyles', SStyle.collectedComponentStyles.length);
		console.log('collectedTextStyles', SStyle.collectedTextStyles.length);
		console.log('collectedSymbols', SSymbol.collectedSymbols.length);
		console.log('overrides', Object.keys(SSymbol.overrides));
		return html;
	}

	save(folder) {
		SNode.folder = folder;
		let html = this.getHtml();
		if (SOptions.css.export) {
			const cssFolder = `${folder}/${SOptions.css.folder}`;
			SUtil.addFolder(cssFolder);
			let shared = [
				`@import "../${SOptions.css.folder}/vars.css";`,
				`@import "../${SOptions.css.folder}/base.css";`,
				`@import "../${SOptions.css.folder}/grid.css";`
			];
			let styles = shared.slice();
			if (SPage.css.styles.typography) {
				styles.push(`@import "../${SOptions.css.folder}/typography.css";`);
				shared.push(`@import "../${SOptions.css.folder}/typography.css";`);
			}
			if (SPage.css.styles.components && !SOptions.component.export) {
				styles.push(`@import "../${SOptions.css.folder}/components.css";`);
			}
			if (SPage.css.styles.page) {
				styles.push(`@import "../${SOptions.css.folder}/page.css";`);
			}
			Object.keys(SPage.css.styles).forEach(s => {
				// if (SPage.css.styles[s].trim() !== '') {
				SUtil.saveTextFile(SPage.css.styles[s], cssFolder, `${s}.css`);
				// }
			});
			SUtil.saveTextFile(styles.join('\n'), cssFolder, 'styles.css');
			if (SOptions.component.export && SSymbol.collectedSymbols.length) {
				SUtil.saveTextFile(shared.join('\n'), cssFolder, 'shared.css');
				const dataFolder = `${folder}/data`;
				SUtil.addFolder(dataFolder);
				SUtil.saveTextFile(SUtil.beautifyJs(
					JSON.stringify(SSymbol.overrides)
				), dataFolder, `data.json`);
			}
			/*
			if (SPage.css.style.trim() !== '') {
				SUtil.saveTextFile(SPage.css.style, cssFolder, 'style.css');
			}
			*/
		}
		if (SOptions.image.export && SImage.collectedImages.length) {
			SUtil.addFolder(`${folder}/${SOptions.image.folder}`);
			SImage.collectedImages.forEach(x => x.save(folder, x.name));
		}
		let svgSprite = '';
		if (SOptions.svg.export && SSvg.collectedSvgs.length) {
			SUtil.addFolder(`${folder}/${SOptions.svg.folder}`);
			SSvg.collectedSvgs.forEach(x => x.svg = SSvg.save(folder, x.name, x.sketchObject));
			if (SOptions.svg.sprite) {
				svgSprite = `
		<svg class="svg-sprite" xmlns="http://www.w3.org/2000/svg" style="display: none;">
			<defs>${SSvg.collectedSvgs.map(x => `
				<g id="${x.name}">
					${x.svg}
				</g>`).join('')}
			</defs>
		</svg>
	`;
			}
		}
		if (SOptions.component.export && SSymbol.collectedSymbols.length) {
			SUtil.copyResource('component.js', `${folder}/${SOptions.component.folder}`);
			SSymbol.collectedSymbols.forEach(x => SSymbol.save(folder, x));
		}
		SUtil.copyResource('LICENSE', folder);
		if (SOptions.html.export) {
			html = html.replace('##svg-sprite##', svgSprite);
			html = SUtil.beautifyHtml(html);
			SUtil.saveTextFile(html, folder, 'index.html');
			SUtil.copyResource('favicon.ico', folder);
			SUtil.copyResource('package.json', folder);
		}
	}

}
