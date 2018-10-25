/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SNode from './snode';
import SUtil from './sutil';

const EXTERNAL = true;

export default class SText extends SNode {

    constructor(node) {
        super(node);
        this.innerText = node.object.text;
        this.alignment = node.object.alignment;

        if (node.object.sharedStyleId) {
            const doc = context.document;
            const styles = doc.documentData().allTextStyles(); // doc.documentData().layerTextStyles().objects();
            const style = styles.find(x => x.objectID() == node.object.sharedStyleId);
            if (style) {
                const className = SUtil.toClassName(style.name());
                this.classes.push(className);
                const collected = SText.collectedTextStyles.find(x => x.className == className);
                if (!collected) {
                    console.log(this.className, style.name());
                    SText.collectedTextStyles.push({
                        className: className,
                        style: SText.parseSharedStyle(style),
                    });
                }
            }

            // MSDocument.currentDocument().documentData().allLayerStyles();
            // MSDocument.currentDocument().documentData().allTextStyles();

            /*
            const doc = SNode.getDocument();
            const sharedStyles = doc.getSharedLayerStyles();
            const style = sharedStyles.find(x => x.id == node.object.sharedStyleId);
            */
            // const styleO = SText.findTextStyleByName(style.name);
            /*
            const doc = SNode.getDocument();
            const sharedStyles = doc.getSharedLayerStyles();
            const style = sharedStyles.find(x => x.id == node.object.sharedStyleId);
            // const style = doc.getSharedLayerStyleWithID(object.sharedStyleId);
            console.log(node.object.sharedStyleId, sharedStyles[0]);
            if (style) {
                // console.log(style.name);
                const msSharedStyle = SText.findTextStyleByName(style.name);
                const msStyle = msSharedStyle.value();
                console.log(msStyle);
            }
            */
        }

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
        const attributes = {
            className: this.className,
        };
        const style = Object.assign(this.style, SUtil.cssStyle(this.styleText));
        if (EXTERNAL) {
            SNode.collectedStyles.push({
                className: this.className,
                pathNames: this.pathNames,
                style: style,
            });
        } else {
            attributes.style = style;
        }
        return attributes;
        /*
        var attributes = {
        'NSColor': NSColor.colorWithRed_green_blue_alpha(0,0,1,1),
        'NSFont' : NSFont.fontWithName_size(fontFamily,scaleValue),
        'NSKern': .3,
        'NSParagraphStyle' : {
            '<class>' : NSMutableParagraphStyle, 
            'style' : {
              'alignment': NSTextAlignmentRight,
              'baseWritingDirection' : '-1',
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

    var name = scaleValue + ' / ' + colorName;

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


    static listTextLayerAttrsFromStyle(layerStyle) {
        const attrs = layerStyle
            .style()
            .primitiveTextStyle()
            .attributes()
            .treeAsDictionary();

        const nsfont = attrs.NSFont;
        const nsparagraph = attrs.NSParagraphStyle;

        let tt;
        try {
            tt =
                layerStyle
                .value()
                .textStyle()
                .encodedAttributes().MSAttributedStringTextTransformAttribute + '';
        } catch (error) {
            tt = null;
        }

        let cc;
        try {
            cc = attrs.MSAttributedStringColorAttribute.value + '';
        } catch (error) {
            cc = null;
        }

        return {
            color: cc,
            nsfont: nsfont.attributes.NSFontNameAttribute + '',
            fontSize: nsfont.attributes.NSFontSizeAttribute + '',
            family: nsfont.family + '',
            name: nsfont.name + '',
            kerning: attrs.NSKern + '',
            alignment: nsparagraph.style.alignment + '',
            lineHeight: nsparagraph.style.maximumLineHeight + '',
            parapgrah: nsparagraph.style.paragraphSpacing + '',
            va: layerStyle
                .value()
                .textStyle()
                .verticalAlignment() + '',
            tt: tt
        };
    }

    static parseSharedStyle(sharedStyle) {
        const style = {};
        style.fontSize = sharedStyle;

        console.log(sharedStyle.style()
            .treeAsDictionary()
        );

        // const g = SText.listTextLayerAttrsFromStyle(sharedStyle);

        console.log(style);
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
        var newText = [[MSTextLayer alloc] initWithFrame:rectTextFrame];

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
        newText.addAttribute_value('MSAttributedStringTextTransformAttribute', textTransform)

        var paragraphStyle = newText.paragraphStyle();
        paragraphStyle.setParagraphSpacing(paragraphSpacing);
        newText.addAttribute_value('NSParagraphStyle', paragraphStyle);

        newText.addAttribute_value('NSStrikethrough', strikethrough);
        newText.addAttribute_value('NSUnderline', underline);

        */
        return style;
    }

    static findTextStyleById(id) {
        var predicate = NSPredicate.predicateWithFormat('id = %@', id);
        return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
    }

    static findTextStyleByName(name) {
        var predicate = NSPredicate.predicateWithFormat('name = %@', name);
        return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
    }

    static collectTextStyles(artboard) {
        // Get sharedObjectID of shared style with specified name
        const doc = context.document;
        const styles = doc.documentData().layerTextStyles().objects();
        styles.forEach(x => console.log(x.name()));

        let layers = NSArray.array();
        let style, predicate;

        const enumerator = styles.objectEnumerator();
        while (style = enumerator.nextObject()) {
            predicate = NSPredicate.predicateWithFormat('style.sharedObjectID == %@', style.objectID());
            layers = layers.arrayByAddingObjectsFromArray(SText.collectLayers(artboard, predicate));
        }
        console.log(artboard.sketchObject.children().length);
        console.log(layers.length);

        /*
        const styleName = 'H1';
        const searchPredicate = NSPredicate.predicateWithFormat('name == %@', styleName);
        const filteredStyles = styles.filteredArrayUsingPredicate(searchPredicate);
        */

        /*
        const filteredLayers = NSArray.array();
        const loopStyles = filteredStyles.objectEnumerator(), style, predicate;

        while (style = loopStyles.nextObject()) {
            predicate = NSPredicate.predicateWithFormat('style.sharedObjectID == %@', style.objectID())
            filteredLayers = filteredLayers.arrayByAddingObjectsFromArray(findLayersMatchingPredicate_inContainer_filterByType(context, predicate, container))
        }

        for (let i = 0; i < filteredLayers.length; i++) {
            filteredLayers[i].style = newStyle;
        }

        return filteredLayers;
        */
    }

    static collectLayers(artboard, predicate) {
        var layers = NSMutableArray.array();
        const instances = artboard.sketchObject.children().filteredArrayUsingPredicate(predicate);
        const instanceLoop = instances.objectEnumerator();
        let instance;
        while ((instance = instanceLoop.nextObject())) {
            layers.addObject(instance);
        }
        return layers;
    }

    /*
    collectSymbols() {
        var layers = NSMutableArray.array();
        var pages = context.document.pages(),
            pageLoop = pages.objectEnumerator(),
            page;
        while (page = pageLoop.nextObject()) {
            var predicate = NSPredicate.predicateWithFormat('className == 'MSSymbolInstance' && symbolMaster == %@', symbolMaster),
                instances = page.children().filteredArrayUsingPredicate(predicate),
                instanceLoop = instances.objectEnumerator(),
                instance;
            while (instance = instanceLoop.nextObject()) {
                layers.addObject(instance);
            }
        }
        return layers;
    }
    */

}

SText.collectedTextStyles = [];