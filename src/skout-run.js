/* jshint esversion: 6 */

// documentation: https://developer.sketchapp.com/reference/api/

import sketch from 'sketch';
import SPage from './skout/spage';
import SUtil from './skout/sutil';

// var sketch = require('sketch');
// var Document = require('sketch/dom');
// var Artboard = require('sketch/dom').Artboard;

const DEBUG_MODE = 1;
const SKIP_FOLDER = 0;

export default function () {

    const artboards = getSelectedArtboards();
    if (artboards.length != 1) {
        message('Please select a single artboards 🙌 ');

    } else {
        const page = SPage.fromArtboard(artboards[0]);
        // console.log('pages', JSON.stringify(pages).replace(/(")(\w*)(\":)/g, ' $2: '));
        // console.log('pages', pages);
        // message(pages.length + ' page found 🙌 ');
        if (SKIP_FOLDER) {
            const html = page.getHtml();
        } else {

            /*
            // options modal
            const modal = newSettingsModal((success) => {
                console.log(success);
            }, (cancel) => message('canceled!'), (error) => message(error));
            */

            const modal = newSelectFolderModal();
            if (modal.runModal()) {
                var folder = modal.URL().path();
                page.exportToFolder(folder);
                message('saved to folder 🙌 ' + folder);
            }
        }
    }

    if (!DEBUG_MODE) {
        SUtil.googleAnalytics('skout', 'run');
    }

    function getSelectedArtboards() {
        const selection = context.selection;
        if (selection) {
            const artboards = selection.slice().filter(x => x.class() == 'MSArtboardGroup');
            return artboards;
        } else {
            return [];
        }
    }

    function removeFolder(path) {
        if (NSFileManager.defaultManager().fileExistsAtPath_(path)) {
            NSFileManager.defaultManager().removeItemAtPath_error_(path, nil);
        }
    }

    function saveTextFile(text, path, name) {
        NSString.stringWithString(text).writeToFile_atomically_encoding_error_(
            path + '/' + name, true, NSUTF8StringEncoding, null
        );
    }

    function openFolder(path) {
        NSWorkspace.sharedWorkspace().selectFile_inFileViewerRootedAtPath(path, nil);
    }

    function exportLayer(object, path, name) {
        const doc = context.document;
        const format = 'svg';
        var exportFormat = MSExportFormat.alloc().init();
        var exportRequest = MSExportRequest.exportRequestFromExportFormat_layer_inRect_useIDForName(
            exportFormat, object, object.frame().rect(), false
        );
        exportRequest.setShouldTrim(false);
        exportRequest.setFormat(format);
        exportRequest.setScale(2);
        // Artboard background color
        exportRequest.setBackgroundColor(object.backgroundColor());
        doc.saveExportRequest_toFile(exportRequest, path + "/folder/" + name + "." + format);
    }

    function newSelectFolderModal() {
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

    function newSettingsModal(complete, cancel, error) {
        const doc = context.document;
        if (doc) {
            const modal = COSAlertWindow.alloc().init(); // .new();
            modal.addTextLabelWithValue('ciao');
            modal.setInformativeText('informative text');
            // modal.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed('icon@2x.png').path()));
            modal.setMessageText('Skout export options');
            // Creating dialog buttons
            modal.addButtonWithTitle('Export');
            modal.addButtonWithTitle('Cancel');
            modal.addTextFieldWithValue('hola');

            const vw = 320;
            const vh = 240;
            const view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, vw, vh));
            modal.addAccessoryView(view);

            if (false) {
                // Create and configure your inputs here
                const label = NSTextField.alloc().initWithFrame(NSMakeRect(10, 0, vw - 20, 40));
                label.setStringValue('Lorem ipsum');
                label.setBezeled(0);
                label.setDrawsBackground(0);
                label.setEditable(0);
                label.setSelectable(0);
                view.addSubview(label);
            }

            if (false) {
                // TextField 1
                const inputField1 = NSTextField.alloc().initWithFrame(NSMakeRect(0, vh - 85, 130, 20));
                inputField1.setStringValue('AAAA');
                view.addSubview(inputField1);
                // TextField 2
                const inputField2 = NSTextField.alloc().initWithFrame(NSMakeRect(140, vh - 85, 130, 20));
                inputField2.setStringValue('BBBB');
                view.addSubview(inputField2);
            }

            const radioButton = NSButtonCell.alloc().init();
            radioButton.setButtonType(NSRadioButton);
            // The matrix will contain all the cells (radio buttons)
            const radioMatrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
                NSMakeRect(0, 20, 400, 50), // Horizontal position, vertical position, width, height
                NSRadioModeMatrix, // This makes the radio buttons work together
                radioButton,
                1, // 1 row
                3 // 3 columns (for 3 radio buttons)
            );
            // Settings the size of the radio buttons
            radioMatrix.setCellSize(CGSizeMake(100, 25));
            // Adding the radio buttons to the form
            const cells = radioMatrix.cells();
            cells.objectAtIndex(0).setTitle('Responsive');
            cells.objectAtIndex(1).setTitle('Percentual');
            cells.objectAtIndex(2).setTitle('Exact');
            // Adding the matrix to the form
            view.addSubview(radioMatrix);

            // Creating the input
            const checkbox = NSButton.alloc().initWithFrame(NSMakeRect(0, vh - 140, vw, 20));
            checkbox.setButtonType(NSSwitchButton);
            checkbox.setBezelStyle(0);
            checkbox.setTitle('Svg sprite');
            checkbox.setState(NSOffState);
            view.addSubview(checkbox);

            const response = modal.runModal();
            if (response == NSOKButton) {

                // const selectedRadioIndex = cells.indexOfObject(radioMatrix.selectedCell());

                const result = {
                    svgSprite: checkbox.stringValue() == '1',
                    isResponsive: cells.objectAtIndex(0).stringValue() == '1',
                    isPercentual: cells.objectAtIndex(1).stringValue() == '1',
                    isExact: cells.objectAtIndex(2).stringValue() == '1',
                };
                console.log('complete', result);
                if (typeof complete == 'function') {
                    complete(result);
                }
            } else if (response == 1001) {
                console.log('cancel');
                if (typeof cancel == 'function') {
                    cancel();
                }
            }
            return modal;
        } else {
            const result = 'Impossible to open 🙌 ';
            console.log('error', result);
            if (typeof error == 'function') {
                error(result);
            }
        }
    }

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

}