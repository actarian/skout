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

const EXTERNAL = true;

export default class SPage extends SNode {

    render() {
        // return new VNode('span', null, [new VText('hello')]);
        // return new VNode('span', this.attributes(), this.nodes.map(x => x.render()));
        const nodes = this.nodes.map(x => x.render());
        const collectedStyles = this.getCss();
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
        max-width: ${this.layout.totalWidth}px;
        margin: 0 auto;
    }

    ${collectedStyles}
                    `)
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
        console.log('collectedTextStyles', SText.collectedTextStyles.length);
        console.log('collectedStyles', SNode.collectedStyles.length);
        return html;
    }

    getCss() {
        const collectedStyles = SText.collectedTextStyles.concat(SNode.collectedStyles).filter(x => Object.keys(x.style).length > 0).map(x => {
            const props = Object.keys(x.style).map(k => {
                const key = k.replace(/([A-Z])/g, "-$1").toLowerCase();
                return `    ${key}: ${x.style[k]};`;
            }).join('\r');
            return `.${x.className} { 
${props} }`;
        }).join('\r\r');
        // console.log('collectedStyles\r', collectedStyles.substr(0, 500));
        return collectedStyles;
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
        //
        // MSDocument.currentDocument().documentData().allLayerStyles();
        // context.document.documentData().allLayerStyles();
        // MSDocument.currentDocument().documentData().allTextStyles();
        // context.document.documentData().allTextStyles();
        //            
        SImage.collectedImages = [];
        SSvg.collectedSvgs = [];
        SNode.collectedStyles = [];
        SText.collectedTextStyles = [];
        // SText.collectTextStyles(artboard);
        const page = SPage.getNode(artboard);
        page.layoutNode(SPage.getLayout(object), 0);
        //
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
        };
    }

    collectTextStyles() {
        /*
        var size = styles[i].size;
        var family = styles[i].font;
        var name = styles[i].name;

        var red = styles[i].color.red;
        var green = styles[i].color.green;
        var blue = styles[i].color.blue;
        var alpha = styles[i].color.alpha;

        var align = styles[i].alignment || 0;
        var spacing = styles[i].spacing || 0;
        var paragraphSpacing = styles[i].paragraphSpacing || 0;
        var lineHeight = styles[i].lineHeight || 0;

        var textTransform = styles[i].textTransform || 0;

        var strikethrough = styles[i].strikethrough || 0;
        var underline = styles[i].underline || 0;

        var rectTextFrame = NSMakeRect(0, 0, 250, 50);
        var newText = [
            [MSTextLayer alloc] initWithFrame: rectTextFrame
        ];

        fonts.push(MSColor.colorWithRed_green_blue_alpha(red, green, blue, alpha))

        var color = fonts[i];

        newText.name = name;
        newText.stringValue = name + ' ' + size + 'px';
        newText.fontSize = size;
        newText.fontPostscriptName = family;

        if (isNaN(red) != true) {
            newText.textColor = color;
        } else {
            newText.textColor = MSColor.colorWithNSColor(NSColor.colorWithGray(0.0));
        }

        newText.textAlignment = align;
        [newText setCharacterSpacing: spacing];
        [newText setLineHeight: lineHeight];
        newText.addAttribute_value("MSAttributedStringTextTransformAttribute", textTransform)

        var paragraphStyle = newText.paragraphStyle();
        paragraphStyle.setParagraphSpacing(paragraphSpacing);
        newText.addAttribute_value("NSParagraphStyle", paragraphStyle);

        newText.addAttribute_value("NSStrikethrough", strikethrough);
        newText.addAttribute_value("NSUnderline", underline);

        checkForMatchingStyles(context, sharedStyles.objects(), name, newText.style());
        findLayersWithSharedStyleNamed_inContainer(context, newText.name(), newText.style())
*/
    }


}