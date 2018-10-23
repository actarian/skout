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
        // const styles = this.getStyles();
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
        maxWidth: ${this.layout.totalWidth}px,
        margin: '0 auto',
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

    static getNode(object, parent) {
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
        return node;
    }

    static getNodes(layers, parent, o) {
        // console.log('SPage.getNodes', layers ? layers.length : null);
        // Shape == SVG
        // ShapePath = Rect & RoundRect & Oval
        if (layers) {
            return layers.filter(layer => (
                !layer.hidden
            )).map((layer, i) => {
                if (o) {
                    o.forEach(x => {
                        if (x.key == layer.id) {
                            if (typeof x.value == 'string') {
                                layer.text = x.value;
                            } else {
                                Object.assign(layer, x.value);
                            }
                        }
                    });
                }
                let layers = layer.layers;
                let overrides = o || [];
                if (layer.symbolId) {
                    const symbol = SPage.doc.getSymbolMasterWithID(layer.symbolId);
                    overrides = SSymbol.getOverrides(layer, overrides);
                    layers = symbol.layers;
                }
                const node = SPage.getNode(layer, parent);
                node.nodes = SPage.getNodes(layers, node, overrides);
                return node;
                /*
                if (layer.symbolId) {
                    const symbol = doc.getSymbolMasterWithID(layer.symbolId);
                    const node = SPage.getNode(symbol, doc).merge({
                        nodes: SPage.getNodes(symbol.layers, node)
                    });
                    return node;
                } else {
                    const node = SPage.getNode(layer, doc).merge({
                        nodes: SPage.getNodes(layer.layers, node)
                    });
                    return node;
                }
                */
            });
        } else {
            return [];
        }
    }

    static fromArtboard(object) {
        // console.log('fromArtboard', width, height);
        // console.log(layout);
        const artboard = Artboard.fromNative(object);
        const doc = artboard.parent.parent;
        SSvg.doc = doc;
        SPage.doc = doc;
        SPage.layerStyles = doc.getSharedLayerStyles();
        SPage.textStyles = doc.getSharedTextStyles();
        SPage.documentData = doc.sketchObject.documentData();
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        const page = new SPage(SPage.getNode(artboard));
        page.nodes = SPage.getNodes(artboard.layers.slice(), null);
        page.layoutNode(SPage.getLayout(object), 0);
        return page;
    }

    static getLayout(object) {
        const frame = object.frame();
        const width = parseInt(frame.width());
        const height = parseInt(frame.height());
        const layout = object.layout();
        const totalWidth = layout.totalWidth();
        const numberOfColumns = layout.numberOfColumns();
        const columnWidth = layout.columnWidth();
        const gutterWidth = layout.gutterWidth();
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