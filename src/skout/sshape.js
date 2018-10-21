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
            const image = SImage.getImage(fill.image());
            const gradient = SNode.cssStyle(this.styleText)['background-image']; // fill.gradient();
            if (image) {
                this.image = image;
                this.imagePath = `img/${this.className}.jpg`;
                backgroundCss = `url('${this.image}') no-repeat center`;
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
            },
        };
    }

    render() {
        return new VNode('span', this.attributes(), []);
    }

}