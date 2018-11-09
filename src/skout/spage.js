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

    render() {
        const nodes = this.renderNodes();
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
            Object.keys(css.styles).forEach(s => {
                headNodes.push(new VNode('link', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: `${SOptions.css.folder}/${s}.css`
                }, []));
            });
            /*
            headNodes.push(new VNode('link', {
                rel: 'stylesheet',
                type: 'text/css',
                href: SOptions.css.folder + '/all.css'
            }, []));
            */
        } else {
            headNodes.push(new VNode('style', null, [
                new VText(css.all)
            ]));
        }
        if (SOptions.component.export) {
            SSymbol.collectedSymbols.forEach(x => headNodes.push(new VNode('script', {
                src: `${SOptions.component.folder}/${x.className}/${x.className}.component.js`,
                type: 'module',
            }, [])));
        }
        return new VNode('html', null, [
            new VNode('head', null, headNodes),
            new VNode('body', null, [
                new VNode('div', this.attributes(), nodes),
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
        return html;
    }

    exportToFolder(folder) {
        SNode.folder = folder;
        let html = this.getHtml();
        SImage.collectedImages.forEach(x => x.save(folder, x.name));
        SSvg.collectedSvgs.forEach(x => x.svg = SSvg.save(folder, x.name, x.sketchObject));
        if (SOptions.css.export) {
            Object.keys(SPage.css.styles).forEach(s => {
                SUtil.saveTextFile(SPage.css.styles[s], `${folder}/${SOptions.css.folder}`, `${s}.css`);
            });
            SUtil.saveTextFile(SPage.css.all, `${folder}/${SOptions.css.folder}`, 'all.css');
        }
        let svgSprite = '';
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
        html = html.replace('##svg-sprite##', svgSprite);
        html = SUtil.beautifyHtml(html);
        SUtil.saveTextFile(html, folder, 'index.html');
        if (SOptions.component.export) {
            SUtil.copyResource('component.js', `${folder}/${SOptions.component.folder}`);
            SUtil.copyResource('favicon.ico', folder);
            SUtil.copyResource('LICENSE', folder);
            SUtil.copyResource('package.json', folder);
            SSymbol.collectedSymbols.forEach(x => SSymbol.save(folder, x));
        }
    }

    static fromArtboard(object) {
        const artboard = Artboard.fromNative(object);
        // MSDocument.currentDocument().documentData().allLayerStyles();
        // context.document.documentData().allLayerStyles();
        // MSDocument.currentDocument().documentData().allTextStyles();
        // context.document.documentData().allTextStyles();
        SStyle.collectedStyles = [];
        SStyle.collectedComponentStyles = [];
        SStyle.collectedTextStyles = [];
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        const layout = SLayout.fromArtboard(object);
        SOptions.layout = layout;
        const page = SPage.getNode(artboard);
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

    static getNode(object, parent, overrides, childOfSymbol) {
        overrides = overrides || {};
        const type = String(object.sketchObject.className());
        const override = overrides[object.id];
        const rect = SRect.fromObject(object);
        let parentRect = rect;
        let originalRect = rect;
        let layers = object.layers || [];
        let collectedStyles = [];
        if (parent) {
            collectedStyles = parent.collectedStyles;
        }
        let node = {
            type,
            object,
            parent,
            rect,
            originalRect,
            childOfSymbol,
            collectedStyles,
        };
        // console.log(type, name);
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
                break;
            case 'MSSymbolInstance':
                let symbolId = object.symbolId;
                if (override && override.symbolID) {
                    symbolId = override.symbolID;
                }
                const symbol = SNode.getDocument().getSymbolMasterWithID(symbolId);
                layers = symbol.layers || [];
                object.layers = layers;
                //
                node = new SSymbol(node);
                node.collectedStyles = [];
                childOfSymbol = true;
                //
                originalRect = SRect.fromObject(symbol);
                node.originalRect = originalRect;
                overrides = {};
                const objectOverrides = object.sketchObject.overrides();
                if (objectOverrides) {
                    Object.keys(objectOverrides).forEach(x => {
                        overrides[x] = objectOverrides[x];
                    });
                }
                if (typeof override == 'object') {
                    Object.keys(override).forEach(x => {
                        overrides[x] = override[x];
                    });
                }
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
                if (override) {
                    node.innerText = override;
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
                const snode = SPage.getNode(layer, node, overrides, childOfSymbol);
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

}