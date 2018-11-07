/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

// const beautify = require('beautify'); 
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
        SPage.collectedStyles = this.getCss();
        const headNodes = [
            new VNode('base', {
                href: '.'
            }, []),
            new VNode('link', {
                rel: 'icon',
                type: 'image/x-icon',
                href: 'favicon.ico'
            }, []),
            SOptions.css.export ? new VNode('link', {
                rel: 'stylesheet',
                type: 'text/css',
                href: SOptions.css.folder + '/skout.css'
            }, []) : new VNode('style', null, [
                new VText(SPage.collectedStyles)
            ])
        ];
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
        console.log('collectedTextStyles', SStyle.collectedTextStyles.length);
        console.log('collectedSymbols', SSymbol.collectedSymbols.length);
        return html;
    }

    getCss() {
        const layout = SOptions.layout;
        const collectedStyles = SStyle.stylesToCss(SStyle.collectedTextStyles.concat(SStyle.collectedStyles.filter(x => !SOptions.component.export || x.selector.indexOf(':host') === -1)));
        return `
        html {
            box-sizing: border-box;
        }
    
        body {
            margin: 0;
            padding: 0;
        }
        
        *,
        *::before,
        *::after {
            box-sizing: inherit;
        }
    
        img {
            display: block;
            width: 100%;
            height: auto;
        }
        
        .container {
            width: 100%;
            max-width: ${layout.totalWidth + layout.gutterWidth * 2}px;
            margin: 0 auto;
            padding: 0 ${layout.gutterWidth};
        }

        .stext {
            display: inline-flex;
        }

        .stext > span {
            width: 100%;
        }
    
        ${collectedStyles}
                        `;
    }

    exportToFolder(folder) {
        SNode.folder = folder;
        let html = this.getHtml();
        SImage.collectedImages.forEach(x => x.save(folder, x.name));
        SSvg.collectedSvgs.forEach(x => x.svg = SSvg.save(folder, x.name, x.sketchObject));
        if (SOptions.css.export) {
            const css = SUtil.beautifyCss(SPage.collectedStyles);
            SUtil.saveTextFile(css, folder + '/' + SOptions.css.folder, 'skout.css');
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
            // let js = SUtil.getResourceText(`component.js`);
            // js = SUtil.beautifyJs(js);
            // SUtil.saveTextFile(js, `${folder}/${SOptions.component.folder}`, `component.js`);
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
        SStyle.collectedTextStyles = [];
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        const layout = SLayout.fromArtboard(object);
        SOptions.layout = layout;
        const page = SPage.getNode(artboard);
        page.zIndex = 0;
        page.parentRect = layout.rect;
        if (SOptions.html.relative) {
            page.setMarginAndPaddings();
        }
        page.setStyle();
        return page;
    }

    static getNode(object, parent, overrides, childOfSymbol) {
        overrides = overrides || {};
        const type = String(object.sketchObject.className());
        const rect = SRect.fromObject(object);
        const override = overrides[object.id];
        let parentRect = rect;
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
                parentRect = SRect.fromObject(symbol);
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
                } else {
                    node = new SNode(node);
                }
                break;
            case 'MSShapeGroup':
            case 'MSShapePathLayer':
                node = new SSvg(node);
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
        if (layers) {
            layers = layers.filter(x => (
                !x.hidden
            ));
            layers = layers.map((layer, i) => {
                const snode = SPage.getNode(layer, node, overrides, childOfSymbol);
                snode.zIndex = i;
                snode.parentRect = parentRect;
                // snode.collectedStyles = parentCollectedStyles;
                return snode;
            });
            node.nodes = layers;
            if (SOptions.html.relative) {
                node.setPosition();
                node.setContainer();
                /*
                node.innerRect = SRect.fromNodes(node.nodes);
                const layout = SOptions.layout;
                // !!!
                if (false && layers.length &&
                    node.rect.width > layout.totalWidth &&
                    node.innerRect.width < layout.totalWidth) {
                    const container = new SContainer(node);
                    container.parentRect = node.rect;
                    container.nodes = layers.filter(x => x.relative);
                    container.innerRect = SRect.fromNodes(container.nodes);
                    container.setPosition();
                    node.nodes = layers.filter(x => x.absolute).concat([container]);
                }
                */
            }
        } else {
            node.nodes = [];
            if (SOptions.html.relative) {
                node.innerRect = node.rect; // SRect.fromNodes(node.nodes);
            }
        }
        return node;
    }

}