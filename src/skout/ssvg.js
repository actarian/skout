/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SNode from './snode';

export default class SSvg extends SNode {

    attributes() {
        return {
            className: this.name.replace(/(?!-)(?!_)(\W*)/g, ''),
            style: {
                position: 'absolute',
                top: this.frame.top + 'px',
                left: this.frame.left + 'px',
                width: '100%',
                height: '100%',
            },
        };
    }

    render() {
        return new VNode('span', this.attributes(), [new VText('svg')]);
    }

}