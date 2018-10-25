/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import SImage from './simage';
import SNode from './snode';

const EXTERNAL = true;

export default class SShape extends SNode {

    attributes() {
        let backgroundCss = 'trasparent';
        let borderCss = 'none';
        let boxShadowCss = 'none';
        const objectStyle = this.sketchObject.style();
        if (objectStyle.hasEnabledFill()) {
            const fill = objectStyle.fills().firstObject();
            const image = fill.image();
            const gradient = SNode.cssStyle(this.styleText)['background-image']; // fill.gradient();
            if (image) {
                const fileName = this.getFileName();
                backgroundCss = `url('img/${fileName}') no-repeat center`;
                if (SNode.folder) {
                    SImage.saveToJpg(image, SNode.folder, 'img/', fileName);
                } else {
                    // backgroundCss = `url('${SImage.getImage(image)}') no-repeat center`;
                }
                /*
                SImage.collectedImages.push({
                    name: filePath,
                    save: (folder, filePath) => {
                        return this.save(folder, filePath);
                    },
                });
                backgroundCss = `url('${filePath}') no-repeat center`;
                */
            } else if (gradient) {
                backgroundCss = gradient;
            } else {
                const fillColor = SNode.toRgb(fill.color());
                backgroundCss = `${fillColor}`;
            }
        }
        if (objectStyle.hasEnabledBorder()) {
            const border = objectStyle.borders().firstObject();
            const borderWidth = border.thickness();
            const borderColor = SNode.toRgb(border.color());
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
        const attributes = {
            className: `shape shape-${this.id}`,
        };
        const style = {
            position: 'absolute',
            display: 'inline-block',
            top: this.frame.top + 'px',
            left: this.frame.left + 'px',
            width: (this.frame.width === this.layout.maxWidth) ? '100%' : this.frame.width + 'px',
            height: this.frame.height + 'px',
            background: backgroundCss,
            border: borderCss,
            boxShadow: boxShadowCss,
            borderRadius: borderRadiusCss,
            backgroundSize: 'cover',
        };
        if (EXTERNAL) {
            SNode.collectedStyles.push({
                className: `shape-${this.id}`,
                pathNames: this.pathNames,
                style: style,
            });
        } else {
            attributes.style = style;
        }
        return attributes;
    }

    save(folder, filePath) {
        var path = folder + '/' + filePath;
        const objectStyle = this.sketchObject.style();
        if (objectStyle.hasEnabledFill()) {
            const fill = objectStyle.fills().firstObject();
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

    getFileName() {
        return `${this.className}-${this.id}.png`;
    }

}