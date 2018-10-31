/* jshint esversion: 6 */

import Artboard from 'sketch/dom';
import toHTML from 'vdom-to-html';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SContainer from './scontainer';
import SImage from './simage';
import SNode from './snode';
import SOptions from './soptions';
import SShape from './sshape';
import SStyle from './sstyle';
import SSvg from './ssvg';
import SSymbol from './ssymbol';
import SText from './stext';
import SUtil from './sutil';

export default class SPage extends SNode {

    render() {
        const nodes = this.nodes.map(x => x.render());
        SPage.collectedStyles = this.getCss();
        return new VNode('html', null, [
            new VNode('head', null, [
                new VNode('base', {
                    href: '.'
                }, []),
                SOptions.css.export ? new VNode('link', {
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: 'css/skout.css'
                }, []) : new VNode('style', null, [
                    new VText(SPage.collectedStyles)
                ]),
            ]),
            new VNode('body', null, [
                new VNode('div', this.attributes(), nodes)
            ])
        ]);
    }

    getHtml() {
        const html = toHTML(this.render());
        // console.log('html =>\n', html);
        console.log('collectedImages', SImage.collectedImages.length);
        console.log('collectedSvgs', SSvg.collectedSvgs.length);
        console.log('collectedStyles', SStyle.collectedStyles.length);
        console.log('collectedTextStyles', SStyle.collectedTextStyles.length);
        return html;
    }

    getCss() {
        const layout = SOptions.layout;
        const collectedStyles = SStyle.collectedTextStyles.concat(SStyle.collectedStyles).filter(x => Object.keys(x.style).length > 0).map(x => {
            const props = Object.keys(x.style).map(k => {
                const key = k.replace(/([A-Z])/g, "-$1").toLowerCase();
                return `    ${key}: ${x.style[k]};`;
            }).join('\r');
            return `.${x.className} { 
${props} }`;
        }).join('\r\r');
        // console.log('collectedStyles\r', collectedStyles.substr(0, 500));
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
        const html = this.getHtml();
        SImage.collectedImages.forEach(x => x.save(folder, x.name));
        SSvg.collectedSvgs.forEach(x => SSvg.save(folder, x.name, x.sketchObject));
        if (SOptions.css.export) {
            SUtil.saveTextFile(SPage.collectedStyles, folder + '/css', 'skout.css');
        }
        SUtil.saveTextFile(html, folder, 'index.html');
    }

    static fromArtboard(object) {
        // console.log('fromArtboard', width, height);
        // console.log(layout);
        const artboard = Artboard.fromNative(object);
        // const doc = SNode.getDocument();
        // console.log(doc, context.document.documentData().metadata());
        // const doc = context.document;
        //
        // MSDocument.currentDocument().documentData().allLayerStyles();
        // context.document.documentData().allLayerStyles();
        // MSDocument.currentDocument().documentData().allTextStyles();
        // context.document.documentData().allTextStyles();
        //            
        SStyle.collectedStyles = [];
        SStyle.collectedTextStyles = [];
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        const layout = SPage.getLayout(object);
        SOptions.layout = layout;
        const page = SPage.getNode(artboard);
        page.zIndex = 0;
        page.parentFrame = layout.frame;
        if (SOptions.html.relative) {
            page.setRelativeLayout();
        }
        page.setStyle();
        //
        return page;
    }

    static getName(name) {
        return name.split('/').pop().trim().replace(/ /g, '-').toLowerCase(); // name.replace(/\//g, '-').replace(/ /g, '');
    }

    static getNode(object, parent, overrides) {
        const type = String(object.sketchObject.className());
        let node = {
            type,
            object,
            parent,
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
                node = new SSymbol(node);
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
                break;
            case 'MSBitmapLayer':
                node = new SImage(node);
                break;
            default:
                node = new SNode(node);
        }
        let layers = object.layers;
        let parentFrame = node.frame;
        if (object.symbolId) {
            const symbol = SNode.getDocument().getSymbolMasterWithID(object.symbolId);
            parentFrame = SNode.getFrame(symbol, 'MSSymbolInstance');
            layers = symbol.layers;
            overrides = SSymbol.getOverrides(object, overrides);
        }
        if (layers) {
            layers = layers.filter(x => (
                !x.hidden
            ));
            layers = layers.map((layer, i) => {
                overrides = overrides || [];
                /*
                // !!!
                overrides.forEach(x => {
                    if (x.key == layer.id) {
                        if (typeof x.value == 'string') {
                            layer.text = x.value;
                        } else {
                            Object.assign(layer, x.value);
                        }
                    }
                });
                */
                const sub = SPage.getNode(layer, node, overrides);
                sub.zIndex = i;
                sub.parentFrame = parentFrame;
                return sub;
            });
            node.nodes = layers;
            if (SOptions.html.responsive) {
                node.setRelativePosition();
                node.setInnerRect();
                const layout = SOptions.layout;
                if (layers.length &&
                    node.frame.width > layout.totalWidth &&
                    node.innerRect.width < layout.totalWidth) {
                    const container = new SContainer(node);
                    container.nodes = layers.filter(x => x.relative);
                    container.setInnerRect();
                    container.setRelativePosition();
                    node.nodes = layers.filter(x => x.absolute).concat([container]);
                }
            }
        } else {
            node.nodes = [];
            if (SOptions.html.responsive) {
                node.setInnerRect();
            }
        }
        return node;
    }

    static getLayout(object) {
        const frame = object.frame();
        const width = parseInt(frame.width());
        const height = parseInt(frame.height());
        const layout = object.layout();
        const totalWidth = layout ? layout.totalWidth() : width;
        const numberOfColumns = layout ? layout.numberOfColumns() : 1;
        const columnWidth = layout ? layout.columnWidth() : width;
        const gutterWidth = layout ? layout.gutterWidth() : 0;
        return {
            maxWidth: width,
            maxHeight: height,
            totalWidth: totalWidth,
            numberOfColumns: numberOfColumns,
            columnWidth: columnWidth,
            gutterWidth: gutterWidth,
            cols: Array.apply(null, Array(numberOfColumns)).map((x, i) => Math.min(totalWidth, Math.floor((columnWidth + gutterWidth) * (i + 1) - gutterWidth))),
            frame: {
                top: 0,
                left: 0,
                right: width,
                bottom: height,
                width: width,
                height: height,
            },
        };
    }

}