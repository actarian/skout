/* jshint esversion: 6 */

// documentation: https://developer.sketchapp.com/reference/api/

import sketch from 'sketch';
import {
    Artboard,
    Document
} from 'sketch/dom';

// var sketch = require('sketch');
// var Document = require('sketch/dom');
// var Artboard = require('sketch/dom').Artboard;

export default function () {

    const doc = Document.getSelectedDocument();

    function getSelectedArtboards() {
        const selection = context.selection;
        if (selection) {
            const artboards = selection.slice().filter(x => x.class() == 'MSArtboardGroup').map(artboard => {
                const frame = artboard.frame();
                // console.log(frame);
                const layout = getLayout(artboard);
                // console.log(layout);
                return Artboard.fromNative(artboard);
            });
            return artboards;
        } else {
            return [];
        }
    }

    function getLayout(artboard) {
        const layout = artboard.layout(); // class: MSLayoutGrid     
        // console.log('w', layout.totalWidth(), 'cols', layout.numberOfColumns(), 'colWidth', layout.columnWidth(), 'gutter', layout.gutterWidth());
    }

    function logLayers(doc, layers, tab = '') {
        // console.log('logLayers', layers ? layers.length : null);
        if (layers) {
            layers.filter(layer => layer.type !== 'Shape' && layer.type !== 'ShapePath').forEach(layer => {
                if (layer.symbolId) {
                    const symbol = doc.getSymbolMasterWithID(layer.symbolId);
                    console.log(tab, getName(symbol.name));
                    logLayers(doc, symbol.layers, tab + '  ');
                    // console.log(symbol);
                } else {
                    if (layer.type !== 'Group') {
                        console.log(tab, getName(layer.name), layer.type);
                    }
                    // console.log(layer.type, layer.name, layer.frame.toString());
                    logLayers(doc, layer.layers, tab + '  ');
                }
            });
        }
    }

    function getName(name) {
        return name.replace(/\//g, '-').replace(/ /g, '');
    }

    function ui() {
        if (doc) {
            sketch.UI.message.apply(this, arguments);
        } else {
            console.log.apply(this, arguments);
        }
    }

    ui('Its alive 🙌 ');

    const artboards = getSelectedArtboards();
    if (artboards.length === 0) {
        ui('No artboards selected.');
    } else {
        artboards.forEach(artboard => {
            logLayers(artboard.parent.parent, artboard.layers.slice());
        });
    }

}