/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import beautify from 'js-beautify';

const GOOGLE_UA = 'UA-128159763-1';
const GOOGLE_UUID = 'google.analytics.uuid';

export default class SUtil {

	static getDocument() {
		return sketch.fromNative(context.document);
	}

	/**
	 * Create Select Box for dialog window
	 * @param  {Array}      options           Options for the select
	 * @param  {Int}        selectedItemIndex Default selected item
	 * @return {NSComboBox}                   Complete select box
	 */
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
		width: 280,
		height: 25
	}) {
		options = options.slice();
		const rows = 1 + Math.floor(options.length / cols);
		const radio = NSButtonCell.alloc().init();
		radio.setButtonType(NSRadioButton);
		radio.setBezelStyle(0);
		const matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
			NSMakeRect(rect.left, rect.top, rect.width, rect.height * rows),
			// NSTrackModeMatrix, // objects are asked to track the mouse with trackMouse:inRect:ofView:untilMouseUp: whenever the cursor is inside their bounds. No highlighting is performed.
			// NSHighlightModeMatrix, // An NSCell is highlighted before it’s asked to track the mouse, then unhighlighted when it’s done tracking.
			// NSRadioModeMatrix, // Selects no more than one NSCell at a time.
			NSRadioModeMatrix, // NSCell objects are highlighted, but don’t track the mouse.
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
				cells.objectAtIndex(i).setTitle(option.title);
				cells.objectAtIndex(i).setState(option.selected ? NSOnState : NSOffState);
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
		return cells ? cells.reduce((a, b, i) => (i < options.length && a.stringValue() == '1') ? options[i].value : null) : null;
	}

	static createCheckboxMatrix(options, cols = 3, rect = {
		left: 0,
		top: 0,
		width: 280,
		height: 25
	}) {
		const keys = Object.keys(options);
		const rows = 1 + Math.floor(keys.length / cols);
		const checkbox = NSButtonCell.alloc().init();
		checkbox.setButtonType(NSSwitchButton);
		checkbox.setBezelStyle(0);
		const matrix = NSMatrix.alloc().initWithFrame_mode_prototype_numberOfRows_numberOfColumns(
			NSMakeRect(rect.left, rect.top, rect.width, rect.height * rows),
			// NSTrackModeMatrix, // objects are asked to track the mouse with trackMouse:inRect:ofView:untilMouseUp: whenever the cursor is inside their bounds. No highlighting is performed.
			// NSHighlightModeMatrix, // An NSCell is highlighted before it’s asked to track the mouse, then unhighlighted when it’s done tracking.
			// NSRadioModeMatrix, // Selects no more than one NSCell at a time.
			NSListModeMatrix, // NSCell objects are highlighted, but don’t track the mouse.
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
				cells.objectAtIndex(i).setTitle(option.title);
				cells.objectAtIndex(i).setState(option.value ? NSOnState : NSOffState);
			} else {
				const r = Math.floor(i / cols);
				const c = i - r * cols;
				matrix.putCell_atRow_column(NSCell.alloc().init(), r, c);
			}
		});
		return matrix;
	}

	static setCheckboxMatrixValues(options, matrix) {
		const keys = Object.keys(options);
		const cells = matrix.cells();
		keys.forEach((key, i) => {
			const option = options[key];
			option.value = cells.objectAtIndex(i).stringValue() == '1';
		});
		return options;
	}

	static toGroupNames(name) {
		return name.toLowerCase().split('/').map(x => x.trim().replace(/ /g, '-'));
	}

	static toComponentName(name) {
		return name.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w|-+)/g, (match, index) => {
			return match === '-' ? '' : match.toUpperCase();
		}) + 'Component';
	}

	static toHash(text) {
		var hash = 0,
			i, chr;
		if (text.length === 0) return hash;
		for (i = 0; i < text.length; i++) {
			chr = text.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	static copyResource(resource, folder) {
		SUtil.addFolder(folder);
		const toPath = `${folder}/${resource}`;
		const toUrl = NSURL.alloc().initFileURLWithPath(toPath);
		const fromUrl = context.plugin.urlForResourceNamed(resource);
		SUtil.removeItem(toPath);
		NSFileManager.defaultManager().copyItemAtURL_toURL_error_(fromUrl, toUrl, nil);
	}

	static readResource(resource) {
		const fromUrl = context.plugin.urlForResourceNamed(resource);
		const source = NSString.alloc().initWithContentsOfURL(fromUrl);
		return source;
	}

	static addFolder(path) {
		if (!NSFileManager.defaultManager().fileExistsAtPath_(path)) {
			NSFileManager.defaultManager().createDirectoryAtPath_attributes(path, {
				withIntermediateDirectories: true
			});
		}
	}

	static removeItem(path) {
		if (NSFileManager.defaultManager().fileExistsAtPath_(path)) {
			NSFileManager.defaultManager().removeItemAtPath_error_(path, nil);
		}
	}

	static saveTextFile(text, path, name) {
		SUtil.addFolder(path);
		NSString.stringWithString(text).writeToFile_atomically_encoding_error_(
			path + '/' + name, true, NSUTF8StringEncoding, null
		);
	}

	static openFolder(path) {
		NSWorkspace.sharedWorkspace().selectFile_inFileViewerRootedAtPath(path, nil);
	}

	static exportLayer(object, path, name, format) {
		format = format || 'svg'; // !!!
		const doc = context.document;
		var exportFormat = MSExportFormat.alloc().init();
		var exportRequest = MSExportRequest.exportRequestFromExportFormat_layer_inRect_useIDForName(
			exportFormat, object, object.frame().rect(), false
		);
		exportRequest.setShouldTrim(false);
		exportRequest.setFormat(format);
		exportRequest.setScale(2);
		// Artboard background color
		exportRequest.setBackgroundColor(object.backgroundColor());
		doc.saveExportRequest_toFile(exportRequest, path + '/' + name + '.' + format);
	}

	static beautifyHtml(html) {
		html = html.replace(/<svg/gm, '\r<svg');
		return beautify.html(html, {
			indent_with_tabs: true,
			preserve_newlines: true,
			max_preserve_newlines: 0,
			keep_array_indentation: true,
			break_chained_methods: true,
			wrap_line_length: 0,
			wrap_attributes: false,
			end_with_newline: true,
			extra_liners: true,
			unformatted: []
		});
	}

	static beautifyCss(css) {
		return beautify.css(css, {
			indent_with_tabs: true,
			preserve_newlines: true,
			max_preserve_newlines: 1,
			keep_array_indentation: true,
			break_chained_methods: true,
			wrap_line_length: 0,
			end_with_newline: true,
			brace_style: 'collapse,preserve-inline',
		});
	}

	static beautifyJs(js) {
		return beautify.js(js);
	}

	static getResourceText(resourceName) {
		const url = context.plugin.urlForResourceNamed(resourceName);
		const resource = NSString.alloc().initWithContentsOfURL(url);
		return resource;
	}

	static googleAnalytics(category, action, label, value) {
		let uuid = NSUserDefaults.standardUserDefaults().objectForKey(GOOGLE_UUID);
		if (!uuid) {
			uuid = NSUUID.UUID().UUIDString();
			NSUserDefaults.standardUserDefaults().setObject_forKey(uuid, GOOGLE_UUID);
		}
		let url = 'https://www.google-analytics.com/collect?v=1';
		// trackingid
		url += '&tid=' + GOOGLE_UA;
		// source
		url += '&ds=sketch' + MSApplicationMetadata.metadata().appVersion;
		// clientid
		url += '&cid=' + uuid;
		// pageview, screenview, event, transaction, item, social, exception, timing
		url += '&t=event';
		// appname
		url += '&an=' + encodeURI(context.plugin.name());
		// appid
		url += '&aid=' + context.plugin.identifier();
		// appversion
		url += '&av=' + context.plugin.version();
		// eventcategory
		url += '&ec=' + encodeURI(category);
		// eventaction
		url += '&ea=' + encodeURI(action);
		// eventlabel
		if (label) {
			url += '&el=' + encodeURI(label);
		}
		// eventvalue
		if (value) {
			url += '&ev=' + encodeURI(value);
		}
		const session = NSURLSession.sharedSession();
		const task = session.dataTaskWithURL(NSURL.URLWithString(NSString.stringWithString(url)));
		task.resume();
	}

}
