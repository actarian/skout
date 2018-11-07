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
import SRect from './srect';

export default class SContainer extends SNode {

    constructor(node) {
        super(node);
        const layout = SOptions.layout;
        this.name = 'container';
        this.type = 'Container';
        this.className = 'container';
        this.rect = new SRect({
            top: 0,
            left: (node.rect.width - layout.totalWidth) / 2,
            width: layout.totalWidth,
            height: node.rect.height,
        });
        this.rect.right = this.rect.left + this.rect.width;
        this.rect.bottom = this.rect.top + this.rect.height;
        this.style = {};
        this.classes.push('scontainer');
    }

    setPosition() {
        const padding = {
            left: (this.innerRect.left - this.rect.left),
            top: (this.innerRect.top - this.rect.top),
            bottom: (this.rect.bottom - this.innerRect.bottom),
            right: (this.rect.right - this.innerRect.right),
        };
        this.nodes.forEach(x => {
            x.rect.left -= padding.left;
            x.rect.top -= padding.top;
            x.rect.right = x.rect.left + x.rect.width;
            x.rect.bottom = x.rect.top + x.rect.height;
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