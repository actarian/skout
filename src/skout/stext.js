/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SNode from './snode';
import SOptions from './soptions';
import SStyle from './sstyle';

export default class SText extends SNode {

    constructor(node) {
        super(node);
        this.innerText = node.object.text;
        this.classes.push('stext');
    }

    getStyle(...rest) {
        const style = SNode.prototype.getStyle.apply(this, rest);
        const sharedStyle = SStyle.getSharedStyle(this.object);
        const localStyle = SStyle.parseTextStyle(this.sketchObject);
        if (SOptions.inline) {
            if (sharedStyle) {
                Object.assign(style, sharedStyle.style);
            } else {
                Object.assign(style, localStyle);
            }
        } else {
            if (sharedStyle) {
                const collected = SStyle.collectedTextStyles.find(x => x.className == sharedStyle.className);
                if (!collected) {
                    SStyle.collectedTextStyles.push(sharedStyle);
                }
                this.classes.push(sharedStyle.className);
            } else {
                Object.assign(style, localStyle);
            }
            SStyle.collectedStyles.push({
                className: this.pathNames.join(' > .'),
                style: style,
            });
        }
        return style;
    }

    attributes() {
        const attributes = {
            className: this.classes.join(' '),
        };
        if (SOptions.inline) {
            attributes.style = this.style;
        }
        return attributes;
    }

    render() {
        return new VNode('span', this.attributes(), [
            new VNode('span', null, [
                new VText(this.innerText)
            ])
        ]);
    }

}