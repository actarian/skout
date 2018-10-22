/* jshint esversion: 6 */

import Artboard from 'sketch/dom';
import toHTML from 'vdom-to-html';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SImage from './simage';
import SNode from './snode';
import SShape from './sshape';
import SStyle from './sstyle';
import SSvg from './ssvg';
import SText from './stext';

const ResizingConstraint = Object.freeze({
    None: 63,
    Top: 31,
    Right: 62,
    Bottom: 55,
    Left: 59,
    Width: 61,
    Height: 47,
});

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

    static getOverrides(layer, results) {
        const overrides = layer.sketchObject.overrides();
        const keys = overrides.allKeys();
        if (keys.length) {
            keys.forEach((key, i) => {
                results.push({
                    key: key,
                    value: overrides[key] // string or dict
                });
            });
        }
        return results;
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
                    overrides = SPage.getOverrides(layer, overrides);
                    layers = symbol.layers;
                }
                const node = SPage.getNode(layer, layers);
                node.i = i;
                node.parent = parent;
                // node.nodes = (node.type !== 'MSShapeGroup' && node.type !== 'MSShapePathLayer') ? SPage.getNodes(layers, node, overrides) : [];
                node.nodes = SPage.getNodes(layers, node, overrides);
                return node;
                /*
                if (layer.symbolId) {
                    const symbol = doc.getSymbolMasterWithID(layer.symbolId);
                    const node = SPage.getNode(symbol, symbol.layers, doc).merge({
                        nodes: SPage.getNodes(symbol.layers, node)
                    });
                    return node;
                } else {
                    const node = SPage.getNode(layer, layer.layers, doc).merge({
                        nodes: SPage.getNodes(layer.layers, node)
                    });
                    return node;
                }
                */
            }).sort((a, b) => a.frame.top - b.frame.top);
        } else {
            return [];
        }
    }

    static isSvg(object) {
        var flag = true;
        object.layers.forEach(x => {
            const className = String(x.sketchObject.className());
            if (className !== 'MSShapeGroup' && className !== 'MSShapePathLayer') {
                flag = false;
            }
        });
        return flag;
    }

    static getNode(object, layers) {
        layers = layers || [];
        const type = String(object.sketchObject.className());
        const groups = object.name.split('/').map(x => x.trim().replace(/ /g, '-').toLowerCase());
        const name = groups.pop();
        const frame = {
            left: type === 'MSArtboardGroup' ? 0 : object.frame.x,
            top: type === 'MSArtboardGroup' ? 0 : object.frame.y,
            width: object.frame.width,
            height: object.frame.height,
        };
        const resizingConstraint = (typeof object.sketchObject.resizingConstraint == 'function') ?
            object.sketchObject.resizingConstraint() : 0;
        const constraint = {
            none: resizingConstraint === ResizingConstraint.None,
            top: (resizingConstraint & ResizingConstraint.Top) === resizingConstraint,
            right: (resizingConstraint & ResizingConstraint.Right) === resizingConstraint,
            bottom: (resizingConstraint & ResizingConstraint.Bottom) === resizingConstraint,
            left: (resizingConstraint & ResizingConstraint.Left) === resizingConstraint,
            width: (resizingConstraint & ResizingConstraint.Width) === resizingConstraint,
            height: (resizingConstraint & ResizingConstraint.Height) === resizingConstraint,
        };
        /*
        const resizesContent = (typeof object.sketchObject.resizesContent == 'function') ?
            object.sketchObject.resizesContent() : 0;
        */
        let node = {
            id: object.id,
            sketchObject: object.sketchObject,
            name,
            groups,
            type,
            constraint,
            frame,
            style: new SStyle(),
            styleText: object.sketchObject.CSSAttributeString().trim(),
            className: name.replace(/(?!-)(?!_)(\W*)/g, ''),
        };
        // console.log(type, name);
        /*
        MSArtboardGroup
        MSLayerGroup
        MSTextLayer
        MSRectangleShape
        MSOvalShape
        MSShapeGroup
        MSShapePathLayer
        MSBitmapLayer
        MSSymbolInstance
        */
        switch (type) {
            case 'MSLayerGroup':
                if (SPage.isSvg(object)) {
                    node = new SSvg(node);
                } else {
                    node = new SNode(node);
                }
                break;
            case 'MSShapeGroup':
            case 'MSShapePathLayer':
                node = new SSvg(node);
                break;
            case 'MSSymbolInstance':
                /*
                object.sketchObject.overridePoints().forEach(function (overridePoint) {
                    console.log(overridePoint.layerName(), overridePoint.name(), overridePoint.property());
                });
                */
                node = new SNode(node);
                break;
            case 'MSRectangleShape':
            case 'MSOvalShape':
                node = new SShape(node);
                break;
            case 'MSTextLayer':
                // console.log(object.text);
                node.innerText = object.text;
                node.alignment = object.alignment;
                /*
                if (object.sharedStyleId) {
                    // console.log(SPage.textStyles);
                    const style = SPage.textStyles.find(x => x.id === object.sharedStyleId);
                    // const style = SPage.doc.getSharedLayerStyleWithID(object.sharedStyleId);
                    if (style) {
                        // console.log(style.name);
                        const msSharedStyle = SPage.findTextStyleByName(style.name);
                        const msStyle = msSharedStyle.value();
                        console.log(msStyle);
                    }
                }
                */
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

    /*
    static findTextStyleByName(name) {
        var predicate = NSPredicate.predicateWithFormat('name = %@', name);
        return SPage.documentData.layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
    }
    */

    static fromArtboard(artboard) {
        const frame = artboard.frame();
        const width = parseInt(frame.width());
        const height = parseInt(frame.height());
        const layout = artboard.layout();
        // console.log('fromArtboard', width, height);
        // console.log(layout);
        artboard = Artboard.fromNative(artboard);
        const doc = artboard.parent.parent;
        SNode.maxWidth = width;
        SSvg.doc = doc;
        SPage.doc = doc;
        SPage.layerStyles = doc.getSharedLayerStyles();
        SPage.textStyles = doc.getSharedTextStyles();
        SPage.documentData = doc.sketchObject.documentData();
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        const page = new SPage(
            SPage.getNode(artboard).merge({
                width,
                height,
                layout: {
                    totalWidth: layout.totalWidth(),
                    numberOfColumns: layout.numberOfColumns(),
                    columnWidth: layout.columnWidth(),
                    gutterWidth: layout.gutterWidth(),
                },
                nodes: SPage.getNodes(artboard.layers.slice(), null)
            }));
        return page;
    }

}