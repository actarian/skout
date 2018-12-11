/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import sketch from 'sketch';
import SModal from './skout/smodal';
import SOptions from './skout/soptions';
import SPage from './skout/spage';
import SUtil from './skout/sutil';

const DEBUG = true;

export default function() {

	// Object.keys(context).forEach(x => console.log(x));
	const folder = context.scriptPath.replace('skout.sketchplugin/Contents/Sketch/skout-run.js', 'docs');
	if (DEBUG) {
		SOptions.getOptions({
			debug: true,
			settings: false,
			save: false,
			launch: false,
			folder: folder,
			mode: 2,
		});
		AppController.sharedInstance().pluginManager().reloadPlugins();
	} else {
		SOptions.getOptions();
	}
	const artboards = getSelectedArtboards();
	if (artboards.length != 1) {
		message(`Please select a single artboard 🌈 `);
	} else {
		if (SOptions.settings) {
			const modal = SModal.newSettingsModal((options) => {
				SOptions.setOptions(options);
				getHtml();
			}, (cancel) => message(`canceled! 🌈`), (error) => message(error));
		} else {
			getHtml();
		}
	}

	function getHtml() {
		// console.log('pages', JSON.stringify(pages).replace(/(")(\w*)(\":)/g, ' $2: '));
		// console.log('pages', pages);
		// message(`${pages.length} pages found 🌈 `);
		if (SOptions.save) {
			const modal = SModal.newSelectFolderModal((folder) => {
				SOptions.folder = folder.path;
				SUtil.addFolder(SOptions.folder);
				const page = SPage.fromArtboard(artboards[0]);
				page.save(SOptions.folder);
				message(`saved to folder ${SOptions.folder} 🌈 `);
			}, (cancel) => message(`canceled! 🌈`), (error) => message(error));
		} else if (SOptions.folder) {
			SUtil.addFolder(SOptions.folder);
			const page = SPage.fromArtboard(artboards[0]);
			page.save(SOptions.folder);
			console.log(`saved to folder ${SOptions.folder} 🌈 `, ``);
		} else {
			const page = SPage.fromArtboard(artboards[0]);
			const html = page.getHtml();
		}
		if (!SOptions.debug) {
			SUtil.googleAnalytics('skout', 'run');
		}
		if (SOptions.launch) {
			SUtil.launch(
				`/bin/bash`,
				[`-l`, `-c`, `npm install --prefix '${SOptions.folder}' ./`],
				false,
				(success) => {
					const task = success.task;
					SModal.newTerminateModal(() => {
						task.terminate();
					});
				},
				(error) => {
					// console.log(error);
					message(`can't find npm 🌈 `);
				});
		}
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
