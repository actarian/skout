/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import sketch from 'sketch';
import VNode from 'virtual-dom/vnode/vnode';
import SNode from './snode';
import SOptions from './soptions';

export default class SSvg extends SNode {

    attributes() {
        return {
            className: this.className,
            version: '1.1',
            x: '0px',
            y: '0px',
            viewBox: `0 0 ${this.rect.width} ${this.rect.height}`,
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'xml:space': 'preserve',
            style: {
                position: 'absolute',
                top: this.rect.top + 'px',
                left: this.rect.left + 'px',
                width: '100%',
                height: '100%',
                enableBackground: `new 0 0 ${this.rect.width} ${this.rect.height}`,
            },
        };
    }

    render() {
        if (this.parentType === 'MSSymbolInstance' || this.type === 'MSLayerGroup') {
            SSvg.collectedSvgs.push({
                name: this.fileName,
                sketchObject: this.sketchObject,
                rect: this.rect,
            });
            const attributes = {
                className: this.className
            };
            const style = {
                position: 'absolute',
                top: this.rect.top + 'px',
                left: this.rect.left + 'px',
                width: '100%',
                height: '100%',
            };
            if (SOptions.inline) {
                attributes.style = style;
            } else {
                this.collectStyle(style);
            }
            if (SOptions.svg.sprite) {
                return new VNode('svg', attributes, [
                    new VNode('use', {
                        'href': `#${this.fileName}`
                    }, [])
                ]);
            } else {
                attributes.src = SSvg.filePath(this.fileName);
                return new VNode('img', attributes, []);
            }
        }
    }

    static filePath(name) {
        return `${SOptions.svg.folder}/${name}.svg`;
    }

    static save(folder, filePath, object) {
        var copy = object.duplicate();
        copy.setName(filePath);
        copy.exportOptions().removeAllExportFormats();
        var exportOption = copy.exportOptions().addExportFormat();
        exportOption.setScale(1);
        const options = {
            compact: true,
            overwrite: true,
            formats: 'svg',
            output: `${folder}/${SOptions.svg.folder}`,
        };
        sketch.export(copy, options);
        copy.removeFromParent();
        let svg = '';
        if (SOptions.svg.sprite) {
            svg = NSString.alloc().initWithContentsOfFile(`${folder}/${SOptions.svg.folder}/${filePath}.svg`);
            const fill = (/<use.*fill="#(\w*)".*>/gm).exec(svg);
            if (fill) {
                svg = svg.replace(/path d/gm, `path fill="#${fill[1]}" d`);
            }
            svg = svg.replace(/(<!--.*)|(<\?xml.*)|(<svg.*)|(<\/svg.*)|(<title.*)|(<desc.*)|(<g.*)|(<\/g.*)|(<mask.*)|(<\/mask.*)|(<defs.*)|(<\/defs.*)|(<use.*)/gm, '');
            // const parser = new DOMParser();
            // const svg = parser.parseFromString(svg, 'text/html');
            // console.log('svg', svg);
        }
        return svg;
    }

    static isSvg(object) {
        const allowedClasses = ['MSLayerGroup', 'MSShapeGroup', 'MSShapePathLayer'];
        let flag = true;
        object.layers.forEach(x => {
            const className = String(x.sketchObject.className());
            if (allowedClasses.indexOf(className) === -1) {
                flag = false;
            }
        });
        return flag;
    }

}

SSvg.collectedSvgs = [];