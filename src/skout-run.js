/* jshint esversion: 6 */

// documentation: https://developer.sketchapp.com/reference/api/

import sketch from 'sketch';
import SPage from './skout/spage';

// var sketch = require('sketch');
// var Document = require('sketch/dom');
// var Artboard = require('sketch/dom').Artboard;

const DEBUG = 0;

export default function () {

    function message(...rest) {
        // const doc = Document.getSelectedDocument();
        const doc = context.document;
        if (doc) {
            sketch.UI.message.apply(this, rest);
            rest.unshift('message');
        } else {
            rest.unshift('no context');
        }
        console.log.apply(this, rest);
    }

    function getArtboards() {
        const selection = context.selection;
        if (selection) {
            const artboards = selection.slice().filter(x => x.class() == 'MSArtboardGroup');
            return artboards;
        } else {
            return [];
        }
    }

    function getFolderModal() {
        //create modal for user to select file
        /*
        var modal = NSOpenPanel.openPanel();
        // modal.setAllowedFileTypes(['json']);
        modal.setCanChooseDirectories(true);
        modal.setCanChooseFiles(false);
        modal.setCanCreateDirectories(false);
        modal.setTitle('Select an output folder');
        modal.setPrompt('Output folder');
        modal.runModal();
        */
        var modal = NSOpenPanel.openPanel();
        // var modal = NSSavePanel.savePanel();
        // modal.setAllowedFileTypes(['json']);
        // modal.setNameFieldStringValue(documentName+'.json');
        modal.setCanChooseDirectories(true);
        modal.setCanChooseFiles(false);
        modal.setCanCreateDirectories(true);
        modal.setTitle('Select an output folder');
        modal.setPrompt('Output folder');
        return modal;
    }

    const artboards = getArtboards();
    if (artboards.length === 0) {
        message('No artboards selected 🙌 ');
    } else {
        const pages = artboards.map(x => SPage.fromArtboard(x));
        // console.log('pages', JSON.stringify(pages).replace(/(")(\w*)(\":)/g, ' $2: '));
        // console.log('pages', pages);
        // message(pages.length + ' page found 🙌 ');
        if (DEBUG) {
            const html = pages[0].getHtml();
        } else {
            const modal = getFolderModal();
            if (modal.runModal()) {
                var folder = modal.URL().path();
                pages[0].exportToFolder(folder);
                message('saved to folder 🙌 ' + folder);
            }
        }
    }

}