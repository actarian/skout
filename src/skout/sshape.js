/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import SImage from './simage';
import SNode from './snode';

export default class SShape extends SNode {

    attributes() {
        let backgroundCss = 'trasparent';
        let borderCss = 'none';
        let boxShadowCss = 'none';
        const style = this.sketchObject.style();
        if (style.hasEnabledFill()) {
            const fill = style.fills().firstObject();
            const image = fill.image();
            const gradient = SNode.cssStyle(this.styleText)['background-image']; // fill.gradient();
            if (image) {
                // this.image = image;
                // this.imagePath = `img/${this.className}.jpg`;
                // backgroundCss = `url('${SImage.getImage(image)}') no-repeat center`;
                const filePath = SImage.filePath(this.className);
                SImage.collectedImages.push({
                    name: filePath,
                    save: (folder, filePath) => {
                        return this.save(folder, filePath);
                    },
                });
                backgroundCss = `url('${filePath}') no-repeat center`;
            } else if (gradient) {
                backgroundCss = gradient;
            } else {
                const fillColor = SNode.toRgb(fill.color());
                backgroundCss = `${fillColor}`;
            }
        }
        if (style.hasEnabledBorder()) {
            const border = style.borders().firstObject();
            const borderWidth = border.thickness();
            const borderColor = SNode.toRgb(border.color());
            borderCss = `${borderWidth}px solid ${borderColor}`;
        }
        if (style.hasEnabledShadow()) {
            const shadow = style.shadows().firstObject();
            const shadowColor = shadow.color();
            const shadowSpread = shadow.spread();
            const shadowX = shadow.offsetX;
            const shadowY = shadow.offsetY;
            const shadowBlur = shadow.blurRadius();
            boxShadowCss = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`;
        }
        const borderRadiusCss = this.type === 'MSRectangleShape' ? this.sketchObject.cornerRadiusFloat() + 'px' : '50%';
        return {
            className,
            style: {
                position: 'absolute',
                display: 'inline-block',
                top: this.frame.top + 'px',
                left: this.frame.left + 'px',
                width: this.frame.width + 'px',
                height: this.frame.height + 'px',
                background: backgroundCss,
                border: borderCss,
                boxShadow: boxShadowCss,
                borderRadius: borderRadiusCss,
                backgroundSize: 'cover',
            },
        };
    }

    save(folder, filePath) {
        var path = folder + '/' + filePath;
        const style = this.sketchObject.style();
        if (style.hasEnabledFill()) {
            const fill = style.fills().firstObject();
            const image = fill.image();
            /*
            const cgRef = image.CGImageForProposedRect_context_hints(null, nil, nil);
            const newRep = NSBitmapImageRep.alloc().initWithCGImage(cgRef);
            newRep.setSize(image.size()); // get original size
            const imageData = newRep.representationUsingType_properties(NSJPEGFileType, {
                NSImageCompressionFactor: 0.8
            });
            imageData.writeToFile(path);
            */
        }
        return path;
    }

    render() {
        return new VNode('span', this.attributes(), []);
    }

}