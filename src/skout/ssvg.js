/* jshint esversion: 6 */

import sketch from 'sketch';
import VNode from 'virtual-dom/vnode/vnode';
import SNode from './snode';

export default class SSvg extends SNode {

    attributes() {
        return {
            className: this.className,
            version: '1.1',
            x: '0px',
            y: '0px',
            viewBox: `0 0 ${this.frame.width} ${this.frame.height}`,
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'xml:space': 'preserve',
            style: {
                position: 'absolute',
                top: this.frame.top + 'px',
                left: this.frame.left + 'px',
                width: '100%',
                height: '100%',
                enableBackground: `new 0 0 ${this.frame.width} ${this.frame.height}`,
            },
        };
    }

    render() {
        // console.log(this.parent.type);
        if (this.parentType === 'MSSymbolInstance' || this.type === 'MSLayerGroup') {
            SSvg.collectedSvgs.push({
                name: this.id,
                sketchObject: this.sketchObject,
            });
            return new VNode('img', {
                className: this.className,
                src: SSvg.filePath(this.className),
                style: {
                    position: 'absolute',
                    top: this.frame.top + 'px',
                    left: this.frame.left + 'px',
                    width: '100%',
                    height: '100%',
                }
            }, []);
            // return new VNode('svg', this.attributes(), this.nodes.map(x => x.render()));
        } else if (this.type === 'MSShapeGroup') {
            return new VNode('g', null, this.nodes.map(x => x.render()));
        } else if (this.type === 'MSShapePathLayer') {
            return new VNode('path', null, []);
        }
        /*
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
        <g id="Layer_2_1_">
        </g>
        <g id="Layer_1_1_">
            <path d="M219.4,134.3l-169.3,170c-20.5,20.5-20.5,53.2,0,73c20.5,20.5,53.2,20.5,73,0l133-132l133.3,130c20.5,20.5,53.2,22.5,73,2
                c10.2-10.2,15-23.2,15-36.9c0-13-4.8-26.6-15-36.9L293.1,134.3c-9.6-9.6-23.2-15-36.9-15C242.6,119.3,229.6,124.8,219.4,134.3z"/>
        </g>
        </svg>
        */
    }

    static filePath(name) {
        return 'svg/' + name + '.svg';
    }

    static save(folder, filePath, object) {
        var copy = object.duplicate();
        copy.exportOptions().removeAllExportFormats();
        var exportOption = copy.exportOptions().addExportFormat();
        exportOption.setScale(1);
        /*
        var path = folder + '/' + filePath;
        // console.log('SSvg.save', path);
        var slices = MSExportRequest.exportRequestsFromExportableLayer(copy);
        for (var i = 0; i < slices.count(); i++) {
            const doc = context.document;
            // console.log(doc);
            // doc.saveArtboardOrSlice(slices[i], path);
            // [doc saveArtboardOrSlice: slices[i] toFile: path];
        }
        */
        const options = {
            compact: true,
            // 'use-id-for-name': true,
            overwrite: true,
            formats: 'svg',
            output: folder + '/svg',
        };
        sketch.export(copy, options);
        copy.removeFromParent();
    }

    static isSvg(object) {
        var flag = true;
        object.layers.forEach(x => {
            const className = String(x.sketchObject.className());
            if (className !== 'MSShapeGroup' && className !== 'MSShapePathLayer') {
                flag = false;
            }
        });
        return flag;
    }

}

SSvg.collectedSvgs = [];