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

    function ui() {
        sketch.UI.message.apply(this, arguments);
    }

    ui('Its alive 🙌 ');

    function getSelectedArtboards() {
        const selection = context.selection;
        const artboards = selection.slice().filter(x => x.class() == 'MSArtboardGroup').map(artboard => {
            const frame = artboard.frame();
            console.log(frame);
            const layout = getLayout(artboard);
            console.log(layout);
            return Artboard.fromNative(artboard);
        });
        return artboards;
    }

    function getLayout(artboard) {
        const layout = artboard.layout(); // class: MSLayoutGrid     
        console.log('w', layout.totalWidth(), 'cols', layout.numberOfColumns(), 'colWidth', layout.columnWidth(), 'gutter', layout.gutterWidth());
    }

    function logLayers(layers, tab = '') {
        console.log('logLayers', layers ? layers.length : null);
        if (layers) {
            layers.forEach(layer => {
                console.log(layer.type, layer.name, layer.frame.toString());
                if (layer.symbolId) {
                    const symbol = doc.getSymbolMasterWithID(layer.symbolId);
                    logLayers(symbol.layers, tab + '\t');
                    // console.log(symbol);
                } else {
                    logLayers(layer.layers, tab + '\t');
                }
            });
        }
    }

    const artboards = getSelectedArtboards();
    if (artboards.length === 0) {
        ui('No artboards selected.');
    } else {
        artboards.forEach(artboard => {
            logLayers(artboard.layers.slice());
        });
    }

}