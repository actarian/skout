/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

const defaultOptions = {
	"settings": true,
	"save": true,
	"launch": true,
	"inline": false,
	"html": {
		"export": true,
		"exact": true,
		"relative": true
	},
	"css": {
		"export": true,
		"folder": "css"
	},
	"image": {
		"export": true,
		"folder": "img",
		"compression": 0.8
	},
	"svg": {
		"export": true,
		"folder": "svg",
		"sprite": true
	},
	"component": {
		"export": false,
		"folder": "components",
		"extract": true
	},
	"log": {
		"layers": false
	},
	"mode": 2,
};

export default class SOptions {

	static set(options) {
		SOptions.storedOptions = options;
		Object.assign(SOptions, options);
		const url = context.plugin.urlForResourceNamed('options.json');
		const text = JSON.stringify(options);
		NSString.stringWithString(text).writeToURL_atomically_encoding_error_(
			url, true, NSUTF8StringEncoding, null
		);
	}

	static setOptions(settings) {
		const options = SOptions.storedOptions;
		options.html.relative = settings.layout.mode === 0;
		options.html.export = settings.assets.html.value;
		options.css.export = settings.assets.css.value;
		options.inline = settings.css.mode === 1;
		options.image.export = settings.assets.image.value;
		options.svg.export = settings.assets.svg.value;
		options.component.export = settings.assets.component.value;
		options.component.extract = settings.component.mode === 1;
		options.launch = settings.launch.launch.value;
		if (options.component.export) {
			options.svg.sprite = false;
		}
		SOptions.set(options);
		console.log(options.component)
		// console.log('setOptions.debug', options.debug, options.component.extract, settings.layout.mode);
	}

	static getOptions(override) {
		const url = context.plugin.urlForResourceNamed('options.json');
		const text = NSString.alloc().initWithContentsOfURL(url);
		let options = defaultOptions;
		try {
			options = JSON.parse(text);
		} catch (error) {
			console.log('getOptions.error', error);
		}
		if (override) {
			Object.assign(options, override);
		}
		SOptions.set(options);
		// console.log('getOptions.debug', options.debug, options.folder);
		const settings = {
			layout: {
				modes: [
					{ title: 'Responsive', value: 0, selected: SOptions.html.relative },
					{ title: 'Exact', value: 1, selected: !SOptions.html.relative },
                ],
				mode: 0,
			},
			assets: {
				html: { title: 'Html', value: SOptions.html.export },
				css: { title: 'Css', value: SOptions.css.export },
				image: { title: 'Images', value: SOptions.image.export },
				svg: { title: 'Svg', value: SOptions.svg.export },
				component: { title: 'Components', value: SOptions.component.export },
			},
			css: {
				modes: [
					{ title: 'Exported', value: 0, selected: !SOptions.inline },
					{ title: 'Inline', value: 1, selected: SOptions.inline },
                ],
				mode: 0,
			},
			component: {
				modes: [
					{ title: 'Single file', value: 0, selected: !SOptions.component.extract },
					{ title: 'Extracted', value: 1, selected: SOptions.component.extract },
				],
				mode: 0,
			},
			launch: {
				launch: { title: 'Launch', value: SOptions.launch },
			},
		};
		return settings;
	}

}
