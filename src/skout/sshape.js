/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import VNode from 'virtual-dom/vnode/vnode';
import SLayer from './slayer';
import SOptions from './soptions';
import SStyle from './sstyle';

export default class SShape extends SLayer {

	constructor(node) {
		super(node);
		this.absolute = true;
		this.relative = false;
		// this.classes.push('sshape');
	}

	/****************
	RENDER
	*****************/

	attributes() {
		const style = Object.assign(this.style, SStyle.parseStyle(this)); // this.getShapeStyle();
		style.position = 'absolute';
		style.display = 'inline-block';
		const attributes = {
			className: this.classes.join(' '),
		};
		switch (this.tagName) {
			case 'button':
				attributes.type = 'button';
				break;
			case 'input':
				attributes.type = 'text';
				const placeholder = this.getInputPlaceholder();
				if (placeholder) {
					attributes.placeholder = placeholder.innerText;
					// attributes.value = placeholder.innerText;
				}
				break;
		}
		if (SOptions.inline) {
			attributes.style = style;
		} else {
			this.collectStyle(style);
		}
		return attributes;
	}

	render() {
		return new VNode(this.tagName, this.attributes(), []);
	}

	/*
	save(folder, filePath) {
		var path = folder + '/' + filePath;
		const objectStyle = this.sketchObject.style();
		if (objectStyle.hasEnabledFill()) {
			const fill = objectStyle.fills().firstObject();
			const image = fill.image();
			// const cgRef = image.CGImageForProposedRect_context_hints(null, nil, nil);
			// const newRep = NSBitmapImageRep.alloc().initWithCGImage(cgRef);
			// newRep.setSize(image.size()); // get original size
			// const imageData = newRep.representationUsingType_properties(NSJPEGFileType, {
			//     NSImageCompressionFactor: 0.8
			// });
			// imageData.writeToFile(path);
		}
		return path;
	}
	*/

	/*
	__getShapeStyle() {
	    let backgroundCss = 'trasparent';
	    let borderCss = 'none';
	    let boxShadowCss = 'none';
	    const objectStyle = this.sketchObject.style();
	    if (objectStyle.hasEnabledFill()) {
	        const fill = objectStyle.fills().firstObject();
	        const image = fill.image();
	        const gradient = SStyle.serializeStyle(this.styleText)['background-image']; // fill.gradient();
	        if (image) {
	            backgroundCss = `url('../${SOptions.image.folder}/${this.className}.png') no-repeat center`;
	            if (SLayer.folder) {
	                SImage.saveToJpg(image, SLayer.folder, `${SOptions.image.folder}/`, `${this.className}.png`);
	            } else {
	                // backgroundCss = `url('${SImage.getImage(image)}') no-repeat center`;
	            }
	        } else if (gradient) {
	            backgroundCss = gradient;
	        } else {
	            const fillColor = SStyle.cssColor(fill.color());
	            backgroundCss = `${fillColor}`;
	        }
	    }
	    if (objectStyle.hasEnabledBorder()) {
	        const border = objectStyle.borders().firstObject();
	        const borderWidth = border.thickness();
	        const borderColor = SStyle.cssColor(border.color());
	        borderCss = `${borderWidth}px solid ${borderColor}`;
	    }
	    if (objectStyle.hasEnabledShadow()) {
	        const shadow = objectStyle.shadows().firstObject();
	        const shadowColor = shadow.color();
	        const shadowSpread = shadow.spread();
	        const shadowX = shadow.offsetX;
	        const shadowY = shadow.offsetY;
	        const shadowBlur = shadow.blurRadius();
	        boxShadowCss = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`;
	    }
	    const borderRadiusCss = this.type === 'MSRectangleShape' ? this.sketchObject.cornerRadiusFloat() + 'px' : '50%';
	    const style = this.style;
	    style.background = backgroundCss;
	    style.border = borderCss;
	    style.boxShadow = boxShadowCss;
	    style.borderRadius = borderRadiusCss;
	    style.backgroundSize = 'cover';
	    return style;
	}
	*/
}
