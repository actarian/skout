/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import sketch from 'sketch';
import VNode from 'virtual-dom/vnode/vnode';
import SNode from './snode';
import SOptions from './soptions';

const SVG_MARKER = /[MmLlSsQqLlHhVvCcSsQqTtAaZz]/g;
const SVG_DIGIT = /-?[0-9]*\.?\d+/g;

export default class SSvg extends SNode {

	render() {
		if (this.parentType === 'MSSymbolInstance' ||
			this.type === 'MSLayerGroup' ||
			this.type === 'MSShapeGroup') {
			SSvg.collectedSvgs.push({
				name: this.fileName,
				sketchObject: this.sketchObject,
				rect: this.rect,
			});
			/*
			const attributes = {
				className: this.className
			};
			const style = {
				position: 'absolute',
				top: this.rect.top + 'px',
				left: this.rect.left + 'px',
				width: '100%',
				height: '100%',
			};
			if (SOptions.inline) {
				attributes.style = style;
			} else {
				this.collectStyle(style);
			}
			*/
			const attributes = this.attributes();
			if (SOptions.svg.sprite) {
				return new VNode('svg', attributes, [
                    new VNode('use', {
						'href': `#${this.fileName}`
					}, [])
                ]);
			} else {
				attributes.src = SSvg.filePath(this.fileName);
				return new VNode('img', attributes, []);
			}
		}
	}

	static filePath(name) {
		return `${SOptions.svg.folder}/${name}.svg`;
	}

	static save(folder, filePath, object) {
		var copy = object.duplicate();
		copy.setName(filePath);
		copy.exportOptions().removeAllExportFormats();
		var exportOption = copy.exportOptions().addExportFormat();
		exportOption.setScale(1);
		const options = {
			compact: true,
			overwrite: true,
			formats: 'svg',
			output: `${folder}/${SOptions.svg.folder}`,
		};
		sketch.export(copy, options);
		copy.removeFromParent();
		let svg = '';
		if (SOptions.svg.sprite) {
			const path = `${folder}/${SOptions.svg.folder}/${filePath}.svg`;
			svg = NSString.alloc().initWithContentsOfFile(path);
			if (svg) {
				const fill = (/<[use|g].*fill="#(\w*)".*>/gm).exec(svg);
				if (fill) {
					svg = svg.replace(/path d/gm, `path fill="#${fill[1]}" d`);
				}
				svg = svg.replace(/(<!--.*)|(<\?xml.*)|(<svg.*)|(<\/svg.*)|(<title.*)|(<desc.*)|(<g.*)|(<\/g.*)|(<mask.*)|(<\/mask.*)|(<defs.*)|(<\/defs.*)|(<use.*)|(\s?id="[^\"]*")/gm, '');
				svg = SSvg.svgRebound(svg);
				// const parser = new DOMParser();
				// const svg = parser.parseFromString(svg, 'text/html');
				// console.log('svg', svg);
			} else {
				console.log('Missing svg', path);
			}
		}
		return svg;
	}

	static isSvg(object) {
		const allowedClasses = ['MSLayerGroup', 'MSShapeGroup', 'MSShapePathLayer', 'MSRectangleShape', 'MSOvalShape'];
		let flag = true;
		object.layers.forEach(x => {
			const className = String(x.sketchObject.className());
			if (allowedClasses.indexOf(className) === -1) {
				flag = false;
			}
		});
		return flag;
	}

	static pathToCommands(path) {
		// -?[0-9]
		const SVG_COMMAND = /([MmLlSsQqLlHhVvCcSsQqTtAaZz])([-.0-9e, ]*)(\s)?/gm;
		const commands = [];
		let command;
		while ((command = SVG_COMMAND.exec(path)) !== null) {
			const SVG_VALUE = /([^, ]+)/gm;
			const marker = command[1];
			const values = [];
			let value;
			while ((value = SVG_VALUE.exec(command[2])) !== null) {
				values.push(parseFloat(value[1]));
			}
			command = {
				marker,
				values,
			};
			commands.push(command);
		}
		return commands;
	}

	static commandsToPath(commands) {
		const path = commands.map((command) => {
			return command.marker + ' ' + command.values.join(',');
		}).join(' ').trim();
		// console.log(path);
		return path;
	}

	static commandsToBounds(commands) {
		const bounds = commands.reduce((prev, command) => {
			return command.values.reduce((prev, value, i) => {
				return {
					left: (i % 2) ? prev.left : Math.min(value, prev.left),
					top: (i % 2) ? Math.min(value, prev.top) : prev.top,
					right: (i % 2) ? prev.right : Math.max(value, prev.right),
					bottom: (i % 2) ? Math.max(value, prev.bottom) : prev.bottom
				};
			}, prev);
		}, {
			left: Number.POSITIVE_INFINITY,
			top: Number.POSITIVE_INFINITY,
			right: Number.NEGATIVE_INFINITY,
			bottom: Number.NEGATIVE_INFINITY
		});
		return bounds;
	}

	static svgRebound(svg) {
		const paths = [];
		svg = svg.replace(/<path[\s\S]*?d="([\s\S]*?)"/gm, (match, group1, offset, string) => {
			const path = group1;
			const commands = SSvg.pathToCommands(path);
			const bounds = SSvg.commandsToBounds(commands);
			paths.push({
				commands,
				bounds,
			});
			return match;
		});
		const svgBounds = paths.reduce((prev, current) => {
			const bounds = current.bounds;
			return {
				left: Math.min(bounds.left, prev.left),
				top: Math.min(bounds.top, prev.top),
				right: Math.max(bounds.right, prev.right),
				bottom: Math.max(bounds.bottom, prev.bottom)
			};
		}, {
			left: Number.POSITIVE_INFINITY,
			top: Number.POSITIVE_INFINITY,
			right: Number.NEGATIVE_INFINITY,
			bottom: Number.NEGATIVE_INFINITY
		});
		// console.log(svgBounds);
		svg = svg.replace(/<path[\s\S]*?d="([\s\S]*?)"/gm, (match, group1, offset, string) => {
			const path = paths.shift();
			const commands = path.commands;
			commands.forEach(command => {
				command.values = command.values.map((v, i) => {
					const n = (i % 2) ? v - svgBounds.top : v - svgBounds.left;
					return parseFloat(n.toFixed(6));
				});
			});
			return match.substr(0, match.length - group1.length - 1) + SSvg.commandsToPath(commands) + '"';
		});
		// console.log(svg);
		return svg;
	}

	static pathRebound(path) {
		const commands = SSvg.pathToCommands(path);
		const bounds = SSvg.commandsToBounds(commands);
		console.log('pathRebound', bounds);
		return path;
	}

	/*
	attributes() {
	    return {
	        className: this.className,
	        version: '1.1',
	        x: '0px',
	        y: '0px',
	        viewBox: `0 0 ${this.rect.width} ${this.rect.height}`,
	        xmlns: 'http://www.w3.org/2000/svg',
	        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
	        'xml:space': 'preserve',
	        style: {
	            position: 'absolute',
	            top: this.rect.top + 'px',
	            left: this.rect.left + 'px',
	            width: '100%',
	            height: '100%',
	            enableBackground: `new 0 0 ${this.rect.width} ${this.rect.height}`,
	        },
	    };
	}
	*/

}

SSvg.collectedSvgs = [];
