/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';

export default class SNode {

    constructor(object) {
        this.merge(object);
    }

    merge(object) {
        if (object) {
            Object.assign(this, object);
        }
        return this;
    }

    attributes() {
        return {
            className: this.name.replace(/(?!-)(?!_)(\W*)/g, ''),
            style: Object.assign({
                position: 'absolute',
                top: this.frame.top + 'px',
                left: this.frame.left + 'px',
                width: this.frame.width + 'px',
                height: this.frame.height + 'px',
                background: 'rgba(0,0,0,0.05)'
            }, SNode.cssStyle(this.styleText)),
            // style: this.styleText
        };
    }

    render() {
        return new VNode('div', this.attributes(), this.nodes.map(x => x.render()));
    }

    static cssStyle(styleText) {
        const style = {};
        styleText.split(';').forEach(x => {
            if (x.indexOf(':') !== -1) {
                const kv = x.split(':');
                style[kv[0].trim()] = kv[1].trim();
            }
        });
        return style;
    }

    static toRgb(color) {
        var r = Math.round(color.red() * 255);
        var g = Math.round(color.green() * 255);
        var b = Math.round(color.blue() * 255);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + color.alpha() + ')';
    }

}