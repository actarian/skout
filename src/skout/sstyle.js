/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SImage from './simage';
import SOptions from './soptions';
import { SUtil, toPxx } from './sutil';

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

	static getSharedStyle(object) {
		let result;
		if (object.sharedStyleId) {
			const doc = context.document;
			const styles = doc.documentData().allTextStyles(); // doc.documentData().layerTextStyles().objects();
			const sharedStyle = styles.find(x => x.objectID() == object.sharedStyleId);
			if (sharedStyle) {
				const className = SStyle.getClassName(sharedStyle.name());
				// console.log(this.className, sharedStyle.name());
				result = {
					className: className,
					selector: ('.' + className),
					style: SStyle.parseTextStyle(sharedStyle),
				};
			}
			/*
			const doc = SUtil.getDocument();
			const sharedStyles = doc.getSharedLayerStyles();
			const style = sharedStyles.find(x => x.id == node.object.sharedStyleId);
			*/
			// const styleO = SStyle.findTextStyleByName(style.name);
			/*
			const doc = SUtil.getDocument();
			const sharedStyles = doc.getSharedLayerStyles();
			const style = sharedStyles.find(x => x.id == node.object.sharedStyleId);
			// const style = doc.getSharedLayerStyleWithID(object.sharedStyleId);
			console.log(node.object.sharedStyleId, sharedStyles[0]);
			if (style) {
			    // console.log(style.name);
			    const msSharedStyle = SStyle.findTextStyleByName(style.name);
			    const msStyle = msSharedStyle.value();
			    console.log(msStyle);
			}
			*/
		}
		return result;
	}

	static parseTextStyle(object) {
		const style = {};
		const objectStyle = object.style();
		if (objectStyle.hasTextStyle()) {
			const attributes = objectStyle.primitiveTextStyle().attributes();
			const color = attributes.MSAttributedStringColorAttribute.hexValue();
			const fontSize = toPxx(attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute));
			const fontFamily = attributes.NSFont.fontDescriptor().objectForKey(NSFontNameAttribute);
			const letterSpacing = toPxx(attributes.NSKern);
			const textTransform = attributes.MSAttributedStringTextTransformAttribute ? ['none', 'uppercase', 'lowercase'][attributes.MSAttributedStringTextTransformAttribute] : 'none';
			const underline = attributes.NSUnderline === 1 ? 'underline' : null;
			const lineThrough = attributes.NSStrikethrough === 1 ? 'line-through' : null;
			const textDecoration = lineThrough || underline;
			//
			const paragraphStyle = attributes.NSParagraphStyle.treeAsDictionary().style;
			const lineHeight = paragraphStyle.maximumLineHeight > 0 ? (paragraphStyle.maximumLineHeight / attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)) : 1;
			const textAlign = ['left', 'right', 'center', 'justify'][paragraphStyle.alignment];
			const paragraphSpacing = paragraphStyle.paragraphSpacing;
			const lineBreakMode = paragraphStyle.lineBreakMode;
			//
			const opacity = objectStyle.contextSettings().opacity();
			//
			// console.log('lineHeight', lineHeight, (paragraphStyle.maximumLineHeight || attributes.NSFont.fontDescriptor().objectForKey(NSFontSizeAttribute)));
			style.color = SStyle.getColor(color);
			style.fontSize = fontSize;
			style.fontFamily = SStyle.getFont(fontFamily);
			style.letterSpacing = letterSpacing;
			style.textAlign = textAlign;
			style.lineHeight = lineHeight;
			if (textTransform !== 'none') {
				style.textTransform = textTransform;
			}
			if (textDecoration) {
				style.textDecoration = textDecoration;
			}
			if (opacity !== 1) {
				style.opacity = opacity;
			}
		}
		// console.log(textStyle);
		return style;

		/*

		*/
		/*
		alignment: nsparagraph.style.alignment + '',
		    lineHeight: nsparagraph.style.maximumLineHeight + '',
		    parapgrah: nsparagraph.style.paragraphSpacing + '',
		    va: layerStyle
		        .value()
		        .textStyle()
		        .verticalAlignment() + '',
		*/
		// alignment = this.object.alignment;
		/*
		NSTextAlignmentLeft
		NSTextAlignmentRight
		NSTextAlignmentCenter
		NSTextAlignmentJustified
		*/
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
		// const g = SStyle.listTextLayerAttrsFromStyle(sharedStyle);

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

	static parseStyle(node) {
		const style = {};
		const sketchObject = node.sketchObject;
		const objectStyle = sketchObject.style();
		let background = 'none';
		if (objectStyle.hasEnabledFill()) {
			const fill = objectStyle.fills().firstObject();
			const fillImage = fill.image();
			const fillGradient = SStyle.serializeStyle(node.styleText)['background-image']; // fill.gradient();
			if (fillImage) {
				const hasAlpha = SImage.hasAlpha(fillImage);
				// console.log('hasAlpha', hasAlpha);
				const extension = hasAlpha ? `png` : `jpg`;
				background = `url('../${SOptions.image.folder}/${node.fileName}.${extension}') no-repeat center`;
				if (hasAlpha) {
					SImage.saveToPng(fillImage, SOptions.folder, SOptions.image.folder, `${node.fileName}.${extension}`);
				} else {
					SImage.saveToJpg(fillImage, SOptions.folder, SOptions.image.folder, `${node.fileName}.${extension}`);
				}
				/* else {
				    backgroundCss = `url('${SImage.getImage(image)}') no-repeat center`;
				}*/
			} else if (fillGradient) {
				background = fillGradient;
			} else {
				const fillColor = SStyle.cssColor(fill.color());
				background = `${SStyle.getColor(fillColor)}`;
			}
		}
		let border = 'none';
		if (objectStyle.hasEnabledBorder()) {
			const _border = objectStyle.borders().firstObject();
			const borderWidth = _border.thickness();
			const borderColor = SStyle.cssColor(_border.color());
			border = `${borderWidth}px solid ${SStyle.getColor(borderColor)}`;
		}
		let borderRadius = 'none';
		if (node.type === 'MSRectangleShape') {
			borderRadius = toPxx(sketchObject.cornerRadiusFloat());
		} else if (node.type === 'MSOvalShape') {
			borderRadius = '50%';
		}
		/*
		if (sketchObject.style().supportsAdvancedBorderSettings()) {
		    // !!!
		}
		*/
		let boxShadow = 'none';
		if (objectStyle.hasEnabledShadow()) {
			const shadow = objectStyle.shadows().firstObject();
			const shadowX = shadow.offsetX();
			const shadowY = shadow.offsetY();
			const shadowBlur = shadow.blurRadius();
			const shadowSpread = shadow.spread();
			const shadowColor = SStyle.cssColor(shadow.color());
			boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${SStyle.getColor(shadowColor)}`;
		}
		if (background !== 'none') {
			style.background = background;
			style.backgroundSize = 'cover';
		}
		if (border !== 'none') {
			style.border = border;
		}
		if (borderRadius !== 'none') {
			style.borderRadius = borderRadius;
		}
		if (boxShadow !== 'none') {
			style.boxShadow = boxShadow;
		}
		return style;
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

	static serializeStyle(styleText) {
		const style = {};
		styleText.split(';').forEach(x => {
			if (x.indexOf(':') !== -1) {
				const kv = x.split(':');
				style[kv[0].trim()] = kv[1].trim();
			}
		});
		return style;
	}

	static cssColor(color) {
		const alpha = color.alpha();
		const r = Math.round(color.red() * 255);
		const g = Math.round(color.green() * 255);
		const b = Math.round(color.blue() * 255);
		if (alpha < 1) {
			return `rgb(${r},${g},${b},${alpha})`;
		} else {
			return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
			// return `rgb(${r},${g},${b})`;
		}
	}

	/*
	static getClassNameCount(name, names) {
		let count = SStyle.collectedNames[name] || 0;
		count++;
		SStyle.collectedNames[name] = count;
		return count > 1 ? '-' + count : '';
	}
	*/

	static getClassName(name) {
		name = SUtil.getFileName(name);
		return name; // + SStyle.getClassNameCount(name);
	}

	static stylesToCss(styles) {
		return styles.filter(x => Object.keys(x.style).length > 0).map(x => {
			const props = Object.keys(x.style).filter(k => x.style[k] !== '0px 0px 0px 0px').map(k => {
				const key = k.replace(/([A-Z])/g, '-$1').toLowerCase();
				const value = x.style[k];
				const rule = `    ${key}: ${value == '0px' ? 0 : value};`;
				/*
				let rule;
				switch (key) {
					case 'color':
						rule = `    ${key}: #${value};`;
						break;
					case 'font-family':
						rule = `    ${key}: '${value}';`;
						break;
					default:
						rule = `    ${key}: ${value == '0px' ? 0 : value};`;
				}
				*/
				return rule;
			}).join('\r');
			return `${x.selector} {
${props} }`;
		}).join('\r\r');
	}

	static getCss() {
		const layout = SOptions.layout;
		const colors = Object.keys(SStyle.collectedColors).map(x => `${SStyle.collectedColors[x]}: ${x};`).join('\n');
		const fonts = Object.keys(SStyle.collectedFonts).map(x => `${SStyle.collectedFonts[x]}: ${x};`).join('\n');
		const vars = SUtil.beautifyCss(`:root {
				${colors}
				${fonts}
			}`);
		const base = SUtil.beautifyCss(SUtil.readResource('base.css'));
		const grid = SStyle.getGrid();
		const typography = SUtil.beautifyCss(SStyle.stylesToCss(SStyle.collectedTextStyles));
		const components = SOptions.component.export ? null : SUtil.beautifyCss(SStyle.stylesToCss(SStyle.collectedComponentStyles));
		const page = SUtil.beautifyCss(SStyle.stylesToCss(SStyle.collectedStyles));
		const styles = {
			vars,
			base,
			grid,
			typography,
		};
		const css = {
			styles: {},
			style: '',
		};
		if (!SOptions.component.export) {
			styles.components = components;
		}
		styles.page = page;
		Object.keys(styles).forEach(s => {
			if (styles[s].trim() !== '') {
				css.styles[s] = `
/* --------------
skout! ${s}
-------------- */

` + styles[s];
			}
			css.style += styles[s];
		});
		return css;
	}

	static getCols() {
		let grid = ``;
		const layout = SOptions.layout;
		if (layout.numberOfColumns > 1) {
			const row = `.row {
				display: flex;
				flex-wrap: wrap;
				margin-right: ${(layout.gutterWidth / -2).toFixed(2)}px;
				margin-left: ${(layout.gutterWidth / -2).toFixed(2)}px;
			}`;
			const cols = new Array(layout.numberOfColumns).fill(0).map((x, i) => {
				return `.col-${i + 1} {
				position: relative;
				width: 100%;
				padding-right: ${(layout.gutterWidth / 2).toFixed(2)}px;
				padding-left: ${(layout.gutterWidth / 2).toFixed(2)}px;
				flex: 0 0 ${(100 / layout.numberOfColumns * (i + 1)).toFixed(3)}%;
				max-width: ${(100 / layout.numberOfColumns * (i + 1)).toFixed(3)}%;
			}`;
			}).join('\n');
			const offsets = new Array(layout.numberOfColumns).fill(0).map((x, i) => {
				return `.offset-${i + 1} {
				margin-left: ${(100 / layout.numberOfColumns * (i + 1)).toFixed(3)}%;
			}`;
			}).join('\n');
			const queryCols = new Array(layout.numberOfColumns).fill(0).map((x, i) => {
				return `.col-${i + 1}`;
			}).join(',\n') + ` {
				flex: 0 0 100%;
				max-width: 100%;
			}`;
			const queryOffsets = new Array(layout.numberOfColumns).fill(0).map((x, i) => {
				return `.offset-${i + 1}`;
			}).join(',\n') + ` {
				margin-left: 0;
			}`;
			const query = `@media (max-width: ${Math.floor(layout.totalWidth * 0.5)}px) {
				${queryCols}
				${queryOffsets}
			}`;
			grid += row + cols + offsets + query;
		}
		return grid;
	}

	static getGrid() {
		const layout = SOptions.layout;
		const grid = SUtil.beautifyCss(`
        .container {
            display: flex;
            justify-content: center;
            width: 100%;
            max-width: ${layout.totalWidth + layout.gutterWidth}px;
            margin-right: auto;
            margin-left: auto;
			padding-right: ${(layout.gutterWidth / 2).toFixed(2)}px;
            padding-left: ${(layout.gutterWidth / 2).toFixed(2)}px;
		}
		.row {
			width:100%;
			flex: 1 0 100%;
			display: flex;
			flex-wrap: wrap;
			margin-right: ${(layout.gutterWidth / -2).toFixed(2)}px;
			margin-left: ${(layout.gutterWidth / -2).toFixed(2)}px;
		}
		.col {
			width: auto;
			flex: 1 1 auto;
		}
		${SStyle.getCols()}
		`);
		return grid;
	}

	// UNUSED !!!
	/*
	static findTextStyleById(id) {
	    var predicate = NSPredicate.predicateWithFormat('id = %@', id);
	    return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
	}

	static findTextStyleByName(name) {
	    var predicate = NSPredicate.predicateWithFormat('name = %@', name);
	    return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
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
	*/

	static collectTextStyles(artboard) {
		// Get sharedObjectID of shared style with specified name
		const doc = context.document;
		const styles = doc.documentData().layerTextStyles().objects();
		// styles.forEach(x => console.log(x.name()));

		let layers = NSArray.array();
		let style, predicate;

		const enumerator = styles.objectEnumerator();
		while (style = enumerator.nextObject()) {
			predicate = NSPredicate.predicateWithFormat('style.sharedObjectID == %@', style.objectID());
			layers = layers.arrayByAddingObjectsFromArray(SText.collectLayers(artboard, predicate));
		}
		// console.log(artboard.sketchObject.children().length);
		// console.log(layers.length);

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

	/*
    collectTextStyles() {
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
}
*/

	/*
	:root {
		--color-1: #ffffff;
	}
	var(--color-1)
	*/
	static getColor(color) {
		color = String(color).length === 6 ? `#${color}` : color;
		color = color.toLowerCase();
		let value = SStyle.collectedColors[color];
		if (!value) {
			const i = Object.keys(SStyle.collectedColors).length;
			value = `--color-${i + 1}`;
			SStyle.collectedColors[color] = value;
		}
		return `var(${value})`;
	}

	static getFont(font) {
		font = `'${font}'`;
		let value = SStyle.collectedFonts[font];
		if (!value) {
			const i = Object.keys(SStyle.collectedFonts).length;
			value = `--font-${i + 1}`;
			SStyle.collectedFonts[font] = value;
		}
		return `var(${value})`;
	}

}

// SStyle.collectedNames = {};
SStyle.collectedColors = {};
SStyle.collectedFonts = {};
SStyle.collectedStyles = [];
SStyle.collectedComponentStyles = [];
SStyle.collectedTextStyles = [];
