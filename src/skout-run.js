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
        // Create and show dialog window  
        const doc = context.document;
        if (doc) {
            /*
            const window = NSWindow.alloc().initWithContentRect(NSMakeRect(0, 0, 800, 800), NSTitledWindowMask | NSClosableWindowMask, 
            NSBackingStoreBuffered, false);
            window.center();
            window.makeKeyAndOrderFront_(window);
            const alert = window[0];
            */
            const alert = modalWithOptions()[0];
            const response = alert.runModal(); // This part shows the dialog windows and stores the 'response' in a variable
            console.log('response', response);
        }

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

    function modalWithOptions() {
        const alert = COSAlertWindow.new();
        alert.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("icon@2x.png").path()));
        alert.setMessageText("Configure your confetti");
        // Creating dialog buttons
        alert.addButtonWithTitle("Ok");
        alert.addButtonWithTitle("Cancel");
        // Creating the view
        const viewWidth = 300;
        const viewHeight = 140;
        const view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, viewWidth, viewHeight));
        alert.addAccessoryView(view);
        // Create and configure your inputs here
        /*
        const label = NSTextField.alloc().initWithFrame(NSMakeRect(x, y, w, h));
        label.setStringValue(text);
        */
        // Create label
        /*
        const infoLabel = sketch.utils.createLabel(NSMakeRect(0, viewHeight - 33, (viewWidth - 100), 35), "Your confetti is distributed in a grid. Setup your grid to get the results you're looking for.");
        view.addSubview(infoLabel);
        */
        // Creating the inputs
        const horizontalTextField = NSTextField.alloc().initWithFrame(NSMakeRect(0, viewHeight - 85, 130, 20));
        const verticalTextField = NSTextField.alloc().initWithFrame(NSMakeRect(140, viewHeight - 85, 130, 20));

        // Adding the textfield 
        view.addSubview(horizontalTextField);
        view.addSubview(verticalTextField);

        // Default values for textfield
        horizontalTextField.setStringValue('5');
        verticalTextField.setStringValue('5');
        // Creating the input
        const checkbox = NSButton.alloc().initWithFrame(NSMakeRect(0, viewHeight - 140, viewWidth, 20));

        // Setting the options for the checkbox
        checkbox.setButtonType(NSSwitchButton);
        checkbox.setBezelStyle(0);
        checkbox.setTitle("Checkbox");
        checkbox.setState(NSOffState); //Change this to NSOnState if you want the checkbox to be selected by default
        // Acts like a template (prototype) for our radio buttons
        const buttonFormat = NSButtonCell.alloc().init();
        buttonFormat.setButtonType(NSRadioButton);

        // The matrix will contain all the cells (radio buttons)
        const matrixFormat = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
            NSMakeRect(0, 20, 400, 50), // Horizontal position, vertical position, width, height
            NSRadioModeMatrix, // This makes the radio buttons work together
            buttonFormat,
            1, // 1 row
            3 // 3 columns (for 3 radio buttons)
        );
        // Settings the size of the radio buttons
        matrixFormat.setCellSize(CGSizeMake(100, 25));

        // Adding the radio buttons to the form
        const cells = matrixFormat.cells();
        cells.objectAtIndex(0).setTitle("Horizontal");
        cells.objectAtIndex(1).setTitle("Vertical");
        cells.objectAtIndex(2).setTitle("Both");

        // Adding the matrix to the form
        view.addSubview(matrixFormat);
        // Show the dialog
        return [alert];
    }

}