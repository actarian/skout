/* jshint esversion: 6 */

export default class SStyle {

    constructor(object) {
        this.merge(object);
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
    }

    static parseStyle(object) {
        const styleTree = object.style().treeAsDictionary();
        const styleObject = SStyle.parseDictionary(styleTree);
        const textStyle = styleObject.textStyle;
        //
        const color = textStyle.MSAttributedStringColorAttribute.value;
        const fontSize = textStyle.NSFont.attributes.NSFontSizeAttribute + 'px';
        const fontFamily = textStyle.NSFont.attributes.NSFontNameAttribute;
        const letterSpacing = textStyle.NSKern + 'px';
        const textTransform = ['none', 'uppercase', 'lowercase'][textStyle.MSAttributedStringTextTransformAttribute];
        const underline = textStyle.NSUnderline === 1 ? 'underline' : null;
        const lineThrough = textStyle.NSStrikethrough === 1 ? 'line-through' : null;
        const textDecoration = lineThrough || underline;
        const paragraphStyle = textStyle.NSParagraphStyle;
        const paragraphSpacing = paragraphStyle.paragraphSpacing;
        const lineHeight = paragraphStyle.minimumLineHeight; // !!!
        const verticalAlignment = ['center', 'B', 'C'][textStyle.textStyleVerticalAlignmentKey]; // !!!
        const alignment = ['left', 'right', 'center', 'justify'][object.alignment]; // !!!
        // alignment = this.object.alignment;
        /*
        NSTextAlignmentLeft
        NSTextAlignmentRight        
        NSTextAlignmentCenter
        NSTextAlignmentJustified
        */
        const style = {
            color,
            fontSize,
            fontFamily,
            letterSpacing,
            alignment,
            lineHeight,
        };
        if (textTransform !== 'none') {
            style.textTransform = textTransform;
        }
        if (verticalAlignment !== 'none') {
            style.verticalAlignment = verticalAlignment;
        }
        if (textDecoration) {
            style.textDecoration = textDecoration;
        }
        // console.log(textStyle);
        return style;
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

        /*
        const keys = styleTree.allKeys();
        keys.forEach(k => {
            const object = styleTree.objectForKey(k);
            console.log(k, object);
        });
        */
        // const g = SText.listTextLayerAttrsFromStyle(sharedStyle);

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
    }

    static parseDictionary(dictionary, output = {}) {
        const types = [
            'NSFontSizeAttribute',
            'NSFontNameAttribute',
            'NSFont',
            'NSKern',
            'MSAttributedStringTextTransformAttribute',
            'MSTextStyle',
            'MSImmutableColor',
            'MSAttributedStringColorAttribute',
            'MSStyleColorControls',
            'MSStyleBlur',
            'MSStyle',
            'MSGraphicsContextSettings',
            'MSStyleBorderOptions',
            'NSParagraphStyle',
        ];
        if (typeof dictionary.allKeys == 'function') {
            const keys = dictionary.allKeys();
            keys.forEach(k => {
                const object = dictionary.objectForKey(k);
                output[k] = SStyle.parseDictionary(object);
                // console.log(k, output[k]);
            });
        } else if (types.indexOf(typeof dictionary) !== -1) {
            output = SStyle.parseDictionary(dictionary.treeAsDictionary());
            // console.log('NSFontSizeAttribute ->', output);
        } else {
            output = dictionary;
        }
        return output;
    }

}