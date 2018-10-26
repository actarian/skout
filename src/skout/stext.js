/* jshint esversion: 6 */

import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import SNode from './snode';
import SStyle from './sstyle';
import SUtil from './sutil';

const EXTERNAL = true;

export default class SText extends SNode {

    constructor(node) {
        super(node);
        this.innerText = node.object.text;
    }

    getStyle(...rest) {
        const style = SNode.prototype.getStyle.apply(this, rest);
        /*
        return Object.assign(style, {
            position: 'absolute',            
        });
        */
        return style;
    }

    attributes() {
        const sharedStyle = this.getSharedStyle();
        const attributes = {
            className: this.classes.join(' '),
        };
        const localStyle = SStyle.parseStyle(this.sketchObject);
        console.log('localStyle', localStyle);
        // const style = Object.assign(this.style, SUtil.cssStyle(this.styleText));
        const style = this.style;
        if (EXTERNAL) {
            if (sharedStyle) {
                SText.collectedTextStyles.push(sharedStyle);
            }
            SNode.collectedStyles.push({
                className: this.className,
                pathNames: this.pathNames,
                style: style,
            });
        } else {
            attributes.style = Object.assign(style, sharedStyle.style);
        }
        return attributes;
    }

    render() {
        return new VNode('span', this.attributes(), [new VText(this.innerText)]);
    }

    getSharedStyle() {
        let result;
        if (this.object.sharedStyleId) {
            const doc = context.document;
            const styles = doc.documentData().allTextStyles(); // doc.documentData().layerTextStyles().objects();
            const sharedStyle = styles.find(x => x.objectID() == this.object.sharedStyleId);
            if (sharedStyle) {
                const className = SUtil.toClassName(sharedStyle.name());
                this.classes.push(className);
                const collected = SText.collectedTextStyles.find(x => x.className == className);
                if (!collected) {
                    // console.log(this.className, sharedStyle.name());
                    result = {
                        className: className,
                        style: SStyle.parseStyle(sharedStyle),
                    };
                }
            }
            /*
            const doc = SNode.getDocument();
            const sharedStyles = doc.getSharedLayerStyles();
            const style = sharedStyles.find(x => x.id == node.object.sharedStyleId);
            */
            // const styleO = SText.findTextStyleByName(style.name);
            /*
            const doc = SNode.getDocument();
            const sharedStyles = doc.getSharedLayerStyles();
            const style = sharedStyles.find(x => x.id == node.object.sharedStyleId);
            // const style = doc.getSharedLayerStyleWithID(object.sharedStyleId);
            console.log(node.object.sharedStyleId, sharedStyles[0]);
            if (style) {
                // console.log(style.name);
                const msSharedStyle = SText.findTextStyleByName(style.name);
                const msStyle = msSharedStyle.value();
                console.log(msStyle);
            }
            */
        }
        return result;
    }

    static listTextLayerAttrsFromStyle(layerStyle) {
        const attrs = layerStyle
            .style()
            .primitiveTextStyle()
            .attributes()
            .treeAsDictionary();

        const nsfont = attrs.NSFont;
        const nsparagraph = attrs.NSParagraphStyle;

        let tt;
        try {
            tt =
                layerStyle
                .value()
                .textStyle()
                .encodedAttributes().MSAttributedStringTextTransformAttribute + '';
        } catch (error) {
            tt = null;
        }

        let cc;
        try {
            cc = attrs.MSAttributedStringColorAttribute.value + '';
        } catch (error) {
            cc = null;
        }

        return {
            color: cc,
            nsfont: nsfont.attributes.NSFontNameAttribute + '',
            fontSize: nsfont.attributes.NSFontSizeAttribute + '',
            family: nsfont.family + '',
            name: nsfont.name + '',
            kerning: attrs.NSKern + '',
            alignment: nsparagraph.style.alignment + '',
            lineHeight: nsparagraph.style.maximumLineHeight + '',
            parapgrah: nsparagraph.style.paragraphSpacing + '',
            va: layerStyle
                .value()
                .textStyle()
                .verticalAlignment() + '',
            tt: tt
        };
    }

    static findTextStyleById(id) {
        var predicate = NSPredicate.predicateWithFormat('id = %@', id);
        return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
    }

    static findTextStyleByName(name) {
        var predicate = NSPredicate.predicateWithFormat('name = %@', name);
        return context.document.documentData().layerTextStyles().sharedStyles().filteredArrayUsingPredicate(predicate).firstObject();
    }

    static collectTextStyles(artboard) {
        // Get sharedObjectID of shared style with specified name
        const doc = context.document;
        const styles = doc.documentData().layerTextStyles().objects();
        // styles.forEach(x => console.log(x.name()));

        let layers = NSArray.array();
        let style, predicate;

        const enumerator = styles.objectEnumerator();
        while (style = enumerator.nextObject()) {
            predicate = NSPredicate.predicateWithFormat('style.sharedObjectID == %@', style.objectID());
            layers = layers.arrayByAddingObjectsFromArray(SText.collectLayers(artboard, predicate));
        }
        // console.log(artboard.sketchObject.children().length);
        // console.log(layers.length);

        /*
        const styleName = 'H1';
        const searchPredicate = NSPredicate.predicateWithFormat('name == %@', styleName);
        const filteredStyles = styles.filteredArrayUsingPredicate(searchPredicate);
        */

        /*
        const filteredLayers = NSArray.array();
        const loopStyles = filteredStyles.objectEnumerator(), style, predicate;

        while (style = loopStyles.nextObject()) {
            predicate = NSPredicate.predicateWithFormat('style.sharedObjectID == %@', style.objectID())
            filteredLayers = filteredLayers.arrayByAddingObjectsFromArray(findLayersMatchingPredicate_inContainer_filterByType(context, predicate, container))
        }

        for (let i = 0; i < filteredLayers.length; i++) {
            filteredLayers[i].style = newStyle;
        }

        return filteredLayers;
        */
    }

    static collectLayers(artboard, predicate) {
        var layers = NSMutableArray.array();
        const instances = artboard.sketchObject.children().filteredArrayUsingPredicate(predicate);
        const instanceLoop = instances.objectEnumerator();
        let instance;
        while ((instance = instanceLoop.nextObject())) {
            layers.addObject(instance);
        }
        return layers;
    }

    /*
    collectSymbols() {
        var layers = NSMutableArray.array();
        var pages = context.document.pages(),
            pageLoop = pages.objectEnumerator(),
            page;
        while (page = pageLoop.nextObject()) {
            var predicate = NSPredicate.predicateWithFormat('className == 'MSSymbolInstance' && symbolMaster == %@', symbolMaster),
                instances = page.children().filteredArrayUsingPredicate(predicate),
                instanceLoop = instances.objectEnumerator(),
                instance;
            while (instance = instanceLoop.nextObject()) {
                layers.addObject(instance);
            }
        }
        return layers;
    }
    */

}

SText.collectedTextStyles = [];