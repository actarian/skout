/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import SOptions from './soptions';

const SModalOk = 1000;
const SModalCancel = 1001;

const RADIO_MATRIX_WIDTH = 200;
const CHECKBOX_MATRIX_WIDTH = 300;

export default class SModal {

	static newSelectFolderModal(complete, cancel, error) {
		const doc = context.document;
		if (doc) {
			//create modal for user to select file
			/*
			var modal = NSOpenPanel.openPanel();
			// modal.setAllowedFileTypes(['json']);
			modal.setCanChooseDirectories(true);
			modal.setCanChooseFiles(false);
			modal.setCanCreateDirectories(false);
			modal.setTitle(`Select an output folder`);
			modal.setPrompt(`Output folder`);
			modal.runModal();
			*/
			var modal = NSOpenPanel.openPanel();
			// var modal = NSSavePanel.savePanel();
			// modal.setAllowedFileTypes(['json']);
			// modal.setNameFieldStringValue(documentName+'.json');
			modal.setCanChooseDirectories(true);
			modal.setCanChooseFiles(false);
			modal.setCanCreateDirectories(true);
			modal.setTitle(`Select an output folder`);
			modal.setPrompt(`Output folder`);
			const response = modal.runModal();
			if (response == NSOKButton) {
				const result = {
					path: modal.URL().path(),
				};
				if (typeof complete == 'function') {
					complete(result);
				}
			} else if (response == 1001) {
				if (typeof cancel == 'function') {
					cancel();
				}
			}
			return modal;
		} else {
			const result = `Impossible to open 🌈 `;
			if (typeof error == 'function') {
				error(result);
			}
		}
	}

	static newSettingsModal(complete, cancel, error) {
		const options = SOptions.getOptions();
		const doc = context.document;
		if (doc) {
			const modal = COSAlertWindow.alloc().init(); // .new();
			const iconUrl = context.plugin.urlForResourceNamed('icon@2x.png');
			modal.setIcon(NSImage.alloc().initByReferencingURL(iconUrl));
			//
			modal.setMessageText(`Skout export options`); // title
			// modal.setInformativeText(`subtitle...`); // subtitle
			//
			// dialog buttons
			modal.addButtonWithTitle('Export');
			modal.addButtonWithTitle('Cancel');
			//
			modal.addTextLabelWithValue(`Select between a responsive or exact layout.`);
			const layoutMatrix = SModal.createRadioMatrix(options.layout.modes);
			modal.addAccessoryView(layoutMatrix);
			/*
			const layoutModeSelect = SModal.createSelect(options.layout.modes, options.layout.mode);
            modal.addAccessoryView(layoutModeSelect);
            */
			//
			modal.addTextLabelWithValue(`Which assets do you want to export?`);
			const assetsMatrix = SModal.createCheckboxMatrix(options.assets);
			modal.addAccessoryView(assetsMatrix);
			//
			modal.addTextLabelWithValue(`Select exported or inline stylesheets.`);
			const cssMatrix = SModal.createRadioMatrix(options.css.modes);
			modal.addAccessoryView(cssMatrix);
			//
			modal.addTextLabelWithValue(`Select extracted or single file components.`);
			const componentMatrix = SModal.createRadioMatrix(options.component.modes);
			modal.addAccessoryView(componentMatrix);
			//
			modal.addTextLabelWithValue(`Launch in browser? Npm required.`);
			const launchMatrix = SModal.createCheckboxMatrix(options.launch);
			modal.addAccessoryView(launchMatrix);
			//
			const response = modal.runModal();
			// console.log('response', response);
			if (response == SModalOk) {
				// const selectedRadioIndex = cells.indexOfObject(radioMatrix.selectedCell());
				// options.layout.mode = layoutModeSelect.indexOfSelectedItem();
				options.layout.mode = SModal.getRadioMatrixValue(options.layout.modes, layoutMatrix);
				options.assets = SModal.getCheckboxMatrixValues(options.assets, assetsMatrix);
				options.css.mode = SModal.getRadioMatrixValue(options.css.modes, cssMatrix);
				options.component.mode = SModal.getRadioMatrixValue(options.component.modes, componentMatrix);
				options.launch = SModal.getCheckboxMatrixValues(options.launch, launchMatrix);
				/*
				const result = {
					svgSprite: checkbox.stringValue() == '1',
					isResponsive: cells.objectAtIndex(0).stringValue() == '1',
					isPercentual: cells.objectAtIndex(1).stringValue() == '1',
					isExact: cells.objectAtIndex(2).stringValue() == '1',
					layoutMode: layoutModeSelect.indexOfSelectedItem(),
                };
                */
				if (typeof complete == 'function') {
					complete(options);
				}
			} else if (response == SModalCancel) {
				if (typeof cancel == 'function') {
					cancel();
				}
			}
			return modal;
		} else {
			const result = `Impossible to open 🌈 `;
			if (typeof error == 'function') {
				error(result);
			}
		}
	}

	static newTerminateModal(complete, error) {
		const doc = context.document;
		if (doc) {
			const modal = COSAlertWindow.alloc().init(); // .new();
			const iconUrl = context.plugin.urlForResourceNamed('icon@2x.png');
			modal.setIcon(NSImage.alloc().initByReferencingURL(iconUrl));
			modal.setMessageText(`Npm process running`); // title
			modal.setInformativeText(`Close this window to terminate`); // subtitle
			modal.addButtonWithTitle('Close');
			const response = modal.runModal();
			if (typeof complete == 'function') {
				complete();
			}
			return modal;
		} else {
			const result = `Impossible to open 🌈 `;
			if (typeof error == 'function') {
				error(result);
			}
		}
	}

	static createSelect(options, selectedItemIndex = 0, rect = {
		left: 0,
		top: 0,
		width: 140,
		height: 25
	}) {
		const select = NSComboBox.alloc().initWithFrame(NSMakeRect(rect.left, rect.top, rect.width, rect.height));
		select.addItemsWithObjectValues(options.map(x => x.title));
		select.selectItemAtIndex(selectedItemIndex);
		return select;
	}

	static createRadioMatrix(options, cols = 2, rect = {
		left: 0,
		top: 0,
		width: RADIO_MATRIX_WIDTH,
		height: 25
	}) {
		options = options.slice();
		const rows = Math.ceil(options.length / cols);
		const radio = NSButtonCell.alloc().init();
		radio.setButtonType(NSRadioButton);
		radio.setBezelStyle(0);
		const matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
			NSMakeRect(rect.left, rect.top, rect.width, rect.height * rows + 15),
			// NSTrackModeMatrix, // objects are asked to track the mouse with trackMouse:inRect:ofView:untilMouseUp: whenever the cursor is inside their bounds. No highlighting is performed.
			// NSHighlightModeMatrix, // An NSCell is highlighted before it’s asked to track the mouse, then unhighlighted when it’s done tracking.
			NSRadioModeMatrix, // Selects no more than one NSCell at a time.
			// NSListModeMatrix, // NSCell objects are highlighted, but don’t track the mouse.
			radio,
			rows, // rows
			cols // columns
		);
		matrix.setCellSize(CGSizeMake(Math.floor(rect.width / cols), rect.height));
		const cells = matrix.cells();
		const totals = cols * rows;
		while (options.length < totals) {
			options.push(null);
		}
		options.forEach((option, i) => {
			if (option) {
				const cell = cells.objectAtIndex(i);
				cell.setTitle(option.title);
				cell.setState(option.selected ? NSOnState : NSOffState);
				cell.setCOSJSTargetFunction((sender) => {
					if (typeof clicked == 'function') {
						clicked(sender);
					}
				});
			} else {
				const r = Math.floor(i / cols);
				const c = i - r * cols;
				matrix.putCell_atRow_column(NSCell.alloc().init(), r, c);
			}
		});
		return matrix;
	}

	static getRadioMatrixValue(options, matrix) {
		const cells = matrix.cells();
		let value = null;
		cells.forEach((x, i) => {
			if (i < options.length && x.stringValue() == '1') {
				value = options[i].value;
			}
		});
		return value;
		// return cells ? cells.reduce((a, b, i) => (i < options.length && a.stringValue() == '1') ? options[i].value : null) : null;
	}

	static createCheckboxMatrix(options, cols = 3, rect = {
		left: 0,
		top: 0,
		width: CHECKBOX_MATRIX_WIDTH,
		height: 25
	}) {
		const keys = Object.keys(options);
		const rows = Math.ceil(keys.length / cols);
		const checkbox = NSButtonCell.alloc().init();
		checkbox.setButtonType(NSSwitchButton);
		checkbox.setBezelStyle(0);
		const matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
			NSMakeRect(rect.left, rect.top, rect.width, rect.height * rows + 15),
			// NSTrackModeMatrix, // objects are asked to track the mouse with trackMouse:inRect:ofView:untilMouseUp: whenever the cursor is inside their bounds. No highlighting is performed.
			NSHighlightModeMatrix, // An NSCell is highlighted before it’s asked to track the mouse, then unhighlighted when it’s done tracking.
			// NSRadioModeMatrix, // Selects no more than one NSCell at a time.
			// NSListModeMatrix, // NSCell objects are highlighted, but don’t track the mouse.
			checkbox,
			rows, // rows
			cols // columns
		);
		matrix.setCellSize(CGSizeMake(Math.floor(rect.width / cols), rect.height));
		const cells = matrix.cells();
		const totals = cols * rows;
		while (keys.length < totals) {
			keys.push(null);
		}
		keys.forEach((key, i) => {
			if (key) {
				const option = options[key];
				const cell = cells.objectAtIndex(i);
				cell.setTitle(option.title);
				cell.setState(option.value ? NSOnState : NSOffState);
				cell.setCOSJSTargetFunction((sender) => {
					if (typeof clicked == 'function') {
						clicked(sender);
					}
				});
			} else {
				const r = Math.floor(i / cols);
				const c = i - r * cols;
				matrix.putCell_atRow_column(NSCell.alloc().init(), r, c);
			}
		});
		return matrix;
	}

	static getCheckboxMatrixValues(options, matrix) {
		const keys = Object.keys(options);
		const cells = matrix.cells();
		const values = {};
		keys.forEach((key, i) => {
			const option = options[key];
			values[key] = {
				title: option.title,
				value: cells.objectAtIndex(i).stringValue() == '1',
			};
		});
		return values;
	}

	static openFolder(path) {
		NSWorkspace.sharedWorkspace().selectFile_inFileViewerRootedAtPath(path, nil);
	}

	/*
	if (false) {
		modal.addTextLabelWithValue(`ciao`);
		modal.addTextFieldWithValue('hola');
		const vw = 320;
		const vh = 240;
		const view = NSView.alloc().initWithFrame(NSMakeRect(0, 0, vw, vh));
		modal.addAccessoryView(view);
	}
	if (false) {
		// Create and configure your inputs here
		const label = NSTextField.alloc().initWithFrame(NSMakeRect(10, 0, vw - 20, 40));
		label.setStringValue(`Lorem ipsum`);
		label.setBezeled(0);
		label.setDrawsBackground(0);
		label.setEditable(0);
		label.setSelectable(0);
		view.addSubview(label);
	}
	if (false) {
		// TextField 1
		const inputField1 = NSTextField.alloc().initWithFrame(NSMakeRect(0, vh - 85, 130, 20));
		inputField1.setStringValue(`AAAA`);
		view.addSubview(inputField1);
		// TextField 2
		const inputField2 = NSTextField.alloc().initWithFrame(NSMakeRect(140, vh - 85, 130, 20));
		inputField2.setStringValue(`BBBB`);
		view.addSubview(inputField2);
	}
	if (false) {
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
		cells.objectAtIndex(0).setTitle(`Responsive`);
		cells.objectAtIndex(1).setTitle(`Percentual`);
		cells.objectAtIndex(2).setTitle(`Exact`);
		// Adding the matrix to the form
		view.addSubview(radioMatrix);
	}
	if (false) {
		// Creating the input
		const checkbox = NSButton.alloc().initWithFrame(NSMakeRect(0, vh - 140, vw, 20));
		checkbox.setButtonType(NSSwitchButton);
		checkbox.setBezelStyle(0);
		checkbox.setTitle(`Svg sprite`);
		checkbox.setState(NSOffState);
		view.addSubview(checkbox);
	}
	*/

}
