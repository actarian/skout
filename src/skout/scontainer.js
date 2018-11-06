/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import VNode from 'virtual-dom/vnode/vnode';
import SNode from './snode';
import SOptions from './soptions';

export default class SContainer extends SNode {

    constructor(node) {
        super(node);
        const layout = SOptions.layout;
        this.name = 'container';
        this.type = 'Container';
        this.className = 'container';
        this.frame = {
            top: 0,
            left: (node.frame.width - layout.totalWidth) / 2,
            width: layout.totalWidth,
            height: node.frame.height,
        };
        this.frame.right = this.frame.left + this.frame.width;
        this.frame.bottom = this.frame.top + this.frame.height;
        this.style = {};
        this.classes.push('scontainer');
    }

    setRelativePosition() {
        const padding = {
            left: (this.innerRect.left - this.frame.left),
            top: (this.innerRect.top - this.frame.top),
            bottom: (this.frame.bottom - this.innerRect.bottom),
            right: (this.frame.right - this.innerRect.right),
        };
        this.nodes.forEach(x => {
            x.frame.left -= padding.left;
            x.frame.top -= padding.top;
            x.frame.right = x.frame.left + x.frame.width;
            x.frame.bottom = x.frame.top + x.frame.height;
        });
        this.padding = padding;
    }

    render() {
        const attributes = {
            className: 'container',
        };
        const PADDING = true;
        if (PADDING) {
            const padding = this.padding;
            const style = {
                padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
            };
            if (SOptions.inline) {
                attributes.style = style;
            } else {
                this.collectStyle(style);
            }
        }
        return new VNode('div', attributes, this.renderNodes());
    }

}