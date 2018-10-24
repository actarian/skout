/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SNode from './snode';

export default class Stext extends SNode {

    constructor(node) {
        super(node);
        this.innerText = node.object.text;
        this.alignment = node.object.alignment;
        /*
        if (object.sharedStyleId) {
            const doc = SNode.getDocument();
            const layerStyle = doc.getSharedLayerStyles();
            // console.log(textStyles);
            const style = textStyles.find(x => x.id === object.sharedStyleId);
            // const style = doc.getSharedLayerStyleWithID(object.sharedStyleId);
            if (style) {
                // console.log(style.name);
                const msSharedStyle = SPage.findTextStyleByName(style.name);
                const msStyle = msSharedStyle.value();
                console.log(msStyle);
            }
        }
        */
    }

    getStyle(...rest) {
        const style = SNode.prototype.getStyle.apply(this, rest);
        /*
        return Object.assign(style, {
            position: 'absolute',            
        });
        */
        return style;
    }

    attributes() {
        return {
            className: this.className,
            style: Object.assign(this.style, SNode.cssStyle(this.styleText))
        };
        /*
        var attributes = {
        'NSColor': NSColor.colorWithRed_green_blue_alpha(0,0,1,1),
        'NSFont' : NSFont.fontWithName_size(fontFamily,scaleValue),
        'NSKern': .3,
        'NSParagraphStyle' : {
            "<class>" : NSMutableParagraphStyle, 
            'style' : {
              'alignment': NSTextAlignmentRight,
              'baseWritingDirection' : "-1",
              'defaultTabInterval' : 0,
              'firstLineHeadIndent' : 0,
              'headIndent' : 0,
              'headerLevel' : 0,
              'hyphenationFactor' : 0,
              'lineBreakMode' : 0,
              'lineHeightMultiple' : 0,
              'lineSpacing' : 0,
              'maximumLineHeight' : 49,
              'minimumLineHeight' : 49,
              'paragraphSpacing' : 32,
              'paragraphSpacingBefore' : 0,
              'tabStops' : [
                28,
                56,
                84,
                112,
                140,
                168,
                196,
                224,
                252,
                280,
                308,
                336
              ],
              'tailIndent' : 0,
            },
        },
    };

    // Create text style
    var style = MSStyle.alloc().init();
    var textStyle = MSTextStyle.styleWithAttributes_(attributes);

    style.setTextStyle(textStyle);

    var name = scaleValue + " / " + colorName;

    // Add the stype to shared styles
    var sharedTextStyles = context.document.documentData().layerTextStyles();
    var s = MSSharedStyle.alloc().initWithName_firstInstance( name, style);

    sharedTextStyles.addSharedObject(s);
    //
    //
    var layer = MSTextLayer.alloc().init();
layer.stringValue = 'hello';
var blue = NSColor.colorWithRed_green_blue_alpha(0,0,1,1);
layer.changeTextColorTo(blue);
layer.setFont(NSFont.fontWithName_size('Arial',20));
layer.textAlignment = NSTextAlignmentRight;
layer.lineHeight = 49;
layer.setKerning(0.3);
var paragraphStyle = layer.paragraphStyle();
paragraphStyle.setParagraphSpacing(32);
layer.addAttribute_value(NSParagraphStyleAttributeName, paragraphStyle);
        */
    }

    render() {
        return new VNode('span', this.attributes(), [new VText(this.innerText)]);
    }

    /*
    static findTextStyleByName(name) {
        var predicate = NSPredicate.predicateWithFormat('name = %@', name);
        return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
    }
    */

}