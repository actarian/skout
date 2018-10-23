/* jshint esversion: 6 */

import SNode from './snode';

export default class SSymbol extends SNode {

    constructor(node) {
        super(node);
        /*
        object.sketchObject.overridePoints().forEach(function (overridePoint) {
            console.log(overridePoint.layerName(), overridePoint.name(), overridePoint.property());
        });
        */
    }

    static getOverrides(layer, results) {
        const overrides = layer.sketchObject.overrides();
        const keys = overrides.allKeys();
        if (keys.length) {
            keys.forEach((key, i) => {
                results.push({
                    key: key,
                    value: overrides[key] // string or dict
                });
            });
        }
        return results;
    }

}