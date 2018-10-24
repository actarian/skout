/* jshint esversion: 6 */

import Artboard from 'sketch/dom';
import toHTML from 'vdom-to-html';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SImage from './simage';
import SNode from './snode';
import SShape from './sshape';
import SSvg from './ssvg';
import SSymbol from './ssymbol';
import SText from './stext';

export default class SPage extends SNode {

    render() {
        // return new VNode('span', null, [new VText('hello')]);
        // return new VNode('span', this.attributes(), this.nodes.map(x => x.render()));
        return new VNode('html', null, [
            new VNode('head', null, [
                new VNode('style', null, [
                    new VText(`
    html {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding: 0;
    }

    .container {
        max-width: ${this.layout.totalWidth}px;
        margin: 0 auto;
    }

    *,
    *::before,
    *::after {
        box-sizing: inherit;
    }
                    `)
                ]),
            ]),
            new VNode('body', null, [
                new VNode('div', this.attributes(), this.nodes.map(x => x.render()))
            ])
        ]);
    }

    getHtml() {
        const html = toHTML(this.render());
        // console.log('html =>\n', html);
        console.log('collectedImages', SImage.collectedImages.length);
        console.log('collectedSvgs', SSvg.collectedSvgs.length);
        return html;
    }

    exportToFolder(folder) {
        SNode.folder = folder;
        const html = this.getHtml();
        var file = NSString.stringWithString(html);
        file.writeToFile_atomically_encoding_error(folder + '/index.html', true, NSUTF8StringEncoding, null);
        // console.log('collectedImages', SImage.collectedImages.length);
        SImage.collectedImages.forEach(x => x.save(folder, x.name));
        // console.log('collectedSvgs', SSvg.collectedSvgs.length);
        SSvg.collectedSvgs.forEach(x => SSvg.save(folder, x.name, x.sketchObject));
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
        if (object.symbolId) {
            const symbol = SNode.getDocument().getSymbolMasterWithID(object.symbolId);
            layers = symbol.layers;
            overrides = SSymbol.getOverrides(object, overrides);
        }
        if (layers) {
            node.nodes = layers.filter(x => (
                !x.hidden
            )).map((layer, i) => {
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
                return SPage.getNode(layer, node, overrides);
            });
        } else {
            node.nodes = [];
        }
        return node;
    }

    static fromArtboard(object) {
        // console.log('fromArtboard', width, height);
        // console.log(layout);
        const artboard = Artboard.fromNative(object);
        // const doc = SNode.getDocument();
        // console.log(doc, context.document.documentData().metadata());
        // const doc = context.document;
        // SPage.layerStyles = doc.getSharedLayerStyles();
        // SPage.textStyles = doc.getSharedTextStyles();
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        const page = SPage.getNode(artboard);
        page.layoutNode(SPage.getLayout(object), 0);
        return page;
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
            cols: Array.apply(null, Array(numberOfColumns)).map((x, i) => Math.min(totalWidth, Math.floor((columnWidth + gutterWidth) * (i + 1) - gutterWidth)))
        }
    }

}