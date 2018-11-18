/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import beautify from 'js-beautify';
import sketch from 'sketch';
import SOptions from './soptions';

const GOOGLE_UA = 'UA-128159763-1';
const GOOGLE_UUID = 'google.analytics.uuid';

export default class SUtil {

	static getNames(text, symbolId) {
		const groups = SUtil.toGroupNames(text);
		const name = groups.pop();
		const fileName = symbolId ? SUtil.getSymbolFileName(name, symbolId) : SUtil.getFileName(name);
		const className = fileName;
		const tagName = SUtil.getTagName(className);
		const componentClassName = SUtil.toComponentName(className);
		const componentTagName = `${className}-component`;
		return { groups, name, fileName, className, tagName, componentClassName, componentTagName };
	}

	static toGroupNames(text) {
		return text.toLowerCase().split('/').map(x => x.trim().replace(/ /g, '-'));
	}

	static getFileName(text) {
		return text.toLowerCase().replace(/(?!-)(?!_)(\W*)/g, '');
	}

	static getTagName(text) {
		let name = text.split('--')[0];
		name = name.indexOf('__') !== -1 ? name.split('__')[1] : name;
		switch (name) {
			case 'a':
			case 'article':
			case 'aside':
			case 'b':
			case 'button':
			case 'footer':
			case 'form':
			case 'header':
				// case 'input':
			case 'label':
			case 'legend':
			case 'li':
			case 'nav':
			case 'ol':
			case 'placeholder':
			case 'section':
			case 'select':
			case 'span':
			case 'strong':
			case 'sup':
			case 'textarea':
			case 'ul':
				break;
			case 'btn':
				name = 'button';
				break;
			default:
				name = 'div';
		}
		return name;
	}

	static getSymbolFileName(text, symbolId) {
		let name = SUtil.collectedSymbolIds[symbolId];
		if (!name) {
			name = SUtil.getFileName(text);
			name += SUtil.getSymbolNameCount(name);
			SUtil.collectedSymbolIds[symbolId] = name;
		}
		return name;
	}

	static getSymbolNameCount(text) {
		let count = SUtil.collectedSymbolNames[text] || 0;
		count++;
		SUtil.collectedSymbolNames[text] = count;
		return count > 1 ? '-' + count : '';
	}

	static toComponentName(text) {
		return text.toLowerCase().replace(/--|__/g, '-').replace(/(?:^\w|[A-Z]|\b\w|-+)/g, (match, index) => {
			return match === '-' ? '' : match.toUpperCase();
		}) + 'Component';
	}

	static getDocument() {
		return sketch.fromNative(context.document);
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

	// SUtil.launch(`/bin/bash`, [`-l`, `-c`, `which npm`], true, (success) => {});
	static launch(path = '/usr/bin/which', commands = [], wait = false, callback = null, error = null) {
		// const pid = NSProcessInfo.processInfo().processIdentifier();
		const pipeOutput = NSPipe.pipe();
		const pipeError = NSPipe.pipe();
		const fileOutput = pipeOutput.fileHandleForReading();
		const fileError = pipeError.fileHandleForReading();
		const task = NSTask.alloc().init();
		task.setLaunchPath_(path);
		if (SOptions.folder) {
			task.setCurrentDirectoryPath_(SOptions.folder);
		}
		task.arguments = commands;
		task.standardOutput = pipeOutput;
		task.standardError = pipeError;
		task.launch();
		if (!wait) {
			if (typeof callback == 'function') {
				callback({ task: task, status: -1 });
			}
			return;
		}
		task.waitUntilExit();
		const status = task.terminationStatus();
		const dataOutput = fileOutput.readDataToEndOfFile();
		const outputCallback = NSString.alloc().initWithData_encoding_(dataOutput, NSUTF8StringEncoding);
		fileOutput.closeFile();
		const dataError = fileError.readDataToEndOfFile();
		const outputError = NSString.alloc().initWithData_encoding_(dataError, NSUTF8StringEncoding);
		fileError.closeFile();
		console.log('output', path, commands, status, outputCallback, outputError);
		const response = {
			output: outputCallback,
			error: outputError,
			status: status,
			task: task,
		};
		if (status == 0) {
			if (wait && typeof callback == 'function') {
				callback(response);
			}
		} else if (typeof error == 'function') {
			error(response);
		}
		return task;
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

SUtil.collectedSymbolIds = {};
SUtil.collectedSymbolNames = {};
