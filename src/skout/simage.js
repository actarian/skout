/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import SNode from './snode';

export default class SImage extends SNode {

    attributes() {
        return {
            className: 'picture ' + this.name.replace(/(?!-)(?!_)(\W*)/g, ''),
            style: {
                minWidth: '100px',
                minHeight: '40px',
                background: 'rgba(0,0,0,0.05)'
            },
            // style: this.styleText
        };
    }

    render() {
        const filePath = SImage.filePath(this.className);
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
            NSImageCompressionFactor: 0.8
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

    static filePath(name) {
        return 'img/' + name + '.jpg';
    }

}

SImage.collectedImages = [];