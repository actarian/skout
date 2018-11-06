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
import SUtil from './sutil';

export default class SImage extends SNode {

    attributes() {
        return {
            className: 'picture ' + this.className,
        };
    }

    render() {
        const filePath = `${SOptions.image.folder}/${this.fileName}-${this.id}.png`;
        SImage.collectedImages.push({
            name: filePath,
            save: (folder, filePath) => {
                return this.save(folder, filePath);
            },
        });
        return new VNode('div', this.attributes(), [
            new VNode('img', {
                // src: SImage.getImage(this.sketchObject.image())
                src: filePath
            })
        ]);
    }

    save(folder, filePath) {
        var path = folder + '/' + filePath;
        const image = this.sketchObject.image();
        const cgRef = image.CGImageForProposedRect_context_hints(null, nil, nil);
        const newRep = NSBitmapImageRep.alloc().initWithCGImage(cgRef);
        newRep.setSize(image.size()); // get original size
        const imageData = newRep.representationUsingType_properties(NSJPEGFileType, {
            NSImageCompressionFactor: SOptions.image.compression
        });
        imageData.writeToFile(path);
        return path;
    }

    static getImage(image) {
        if (image instanceof MSImageData) {
            const nsImage = image.image();
            // const nsData = image.data();
            return SImage.nsImageToJpg(nsImage);
        }
        /*
        an ImageData ??
        a native NSImage
        a native NSURL
        a native MSImageData
        a string: path to the file to load the image from
        an object with a path property: path to the file to load the image from
        an object with a base64 string: a base64 encoded image
        */
    }

    static nsImageToPng(nsImage) {
        const cgRef = nsImage.CGImageForProposedRect_context_hints(null, nil, nil);
        const newRep = NSBitmapImageRep.alloc().initWithCGImage(cgRef);
        newRep.setSize(nsImage.size()); // get original size
        const imageData = newRep.representationUsingType_properties(NSPNGFileType, nil);
        return NSString.stringWithFormat('data:%@;base64,%@', 'image/png', imageData.base64EncodedStringWithOptions(0));
    }

    static nsImageToJpg(nsImage) {
        const cgRef = nsImage.CGImageForProposedRect_context_hints(null, nil, nil);
        const newRep = NSBitmapImageRep.alloc().initWithCGImage(cgRef);
        newRep.setSize(nsImage.size()); // get original size
        const imageData = newRep.representationUsingType_properties(NSJPEGFileType, {
            NSImageCompressionFactor: 0.8
        });
        // imageData.writeToFile(fileName);       
        return NSString.stringWithFormat('data:%@;base64,%@', 'image/jpeg', imageData.base64EncodedStringWithOptions(0));
    }

    static isPng(image) {
        const base64 = image.data().base64EncodedStringWithOptions(0);
        const unicode = new Buffer(base64.substr(0, 16), 'base64').toString();
        const flag = unicode.indexOf('PNG') !== -1;
        // const len = binaryString.length;
        console.log(base64.substr(0, 16), unicode, flag);
        return flag;
    }

    static saveToJpg(image, folder, filepath, filename) {
        // console.log('saveJpg', image, folder, filepath, filename);
        if (image instanceof MSImageData) {
            // const isPng = SImage.isPng(image);
            // console.log('isPng', isPng);
            /*
            // var buffer; // new Uint8Array(8);
            const pointer = MOPointer.alloc().initWithValue(null);
            // const pointer = MOPointer.alloc().init();
            // image.data().getBytes_range(pointer, NSMakeRange(0, 1));
            image.data().getBytes_length(pointer, 1);
            */
            const nsImage = image.image();
            // const nsData = image.data();
            const cgRef = nsImage.CGImageForProposedRect_context_hints(null, nil, nil);
            const newRep = NSBitmapImageRep.alloc().initWithCGImage(cgRef);
            newRep.setSize(nsImage.size()); // get original size
            /*
            const imageData = newRep.representationUsingType_properties(NSJPEGFileType, {
                NSImageCompressionFactor: 0.8
            });
            */
            const imageData = newRep.representationUsingType_properties(NSPNGFileType, nil);
            // console.log(NSFileManager.defaultManager());
            SUtil.addFolder(folder + '/' + filepath);
            imageData.writeToFile(folder + '/' + filepath + filename);
            // console.log('saveJpg.writeToFile', folder, filepath, filename);
            // return NSString.stringWithFormat('data:%@;base64,%@', 'image/jpeg', imageData.base64EncodedStringWithOptions(0));
        }
    }

}

SImage.collectedImages = [];