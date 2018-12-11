/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

import sketch from 'sketch';
import svg from 'virtual-dom/virtual-hyperscript/svg';
import VNode from 'virtual-dom/vnode/vnode';
import SLayer from './slayer';
import SOptions from './soptions';

const SVG_MARKER = /[MmLlSsQqLlHhVvCcSsQqTtAaZz]/g;
const SVG_DIGIT = /-?[0-9]*\.?\d+/g;

export default class SSvg extends SLayer {

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
				svg = svg.replace(/(<!--.*)|(<\?xml.*)|(<svg.*)|(<\/svg.*)|(<title.*)|(<desc.*)|(<g.*)|(<\/g.*)|(<mask.*)|(<\/mask.*)|(<defs.*)|(<\/defs.*)|(<use.*)|(\s?mask="[^\"]*")|(\s?id="[^\"]*")/gm, '');
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
		// 'MSLayerGroup',
		const allowedClasses = ['MSShapeGroup', 'MSShapePathLayer', 'MSRectangleShape', 'MSOvalShape'];
		let flag = true;
		// console.log(object.sketchObject.className());
		object.layers.forEach(x => {
			const type = String(x.sketchObject.className());
			// console.log(x.name, type);
			if (allowedClasses.indexOf(type) === -1) {
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

	static findValue(string, regexp) {
		const matches = string.match(regexp);
		return matches && matches.length > 1 ? parseFloat(matches[1]) : 0;
	}

	static findPoints(string, regexp) {
		const matches = string.match(regexp);
		return matches && matches.length > 1 ? matches[1].split(' ').map(x => parseFloat(x)) : [];
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
		const circles = [];
		const regCircles = /<circle[\s\S]*?<\/circle>/gm;
		let circle;
		while (circle = regCircles.exec(String(svg))) {
			const c = circle[0];
			const cx = SSvg.findValue(c, /<circle[\s\S]*?cx="([\s\S]*?)"/);
			const cy = SSvg.findValue(c, /<circle[\s\S]*?cy="([\s\S]*?)"/);
			const r = SSvg.findValue(c, /<circle[\s\S]*?r="([\s\S]*?)"/);
			// console.log(cx, cy, r);
			circles.push({
				props: {
					r,
					cx,
					cy,
				},
				bounds: {
					left: cx - r,
					top: cy - r,
					right: cx + r,
					bottom: cy + r,
				},
			});
		}
		const rects = [];
		const regRects = /<rect[\s\S]*?<\/rect>/gm;
		let rect;
		while (rect = regRects.exec(String(svg))) {
			const r = rect[0];
			const width = SSvg.findValue(r, /<rect[\s\S]*?width="([\s\S]*?)"/);
			const height = SSvg.findValue(r, /<rect[\s\S]*?height="([\s\S]*?)"/);
			const x = SSvg.findValue(r, /<rect[\s\S]*?x="([\s\S]*?)"/);
			const y = SSvg.findValue(r, /<rect[\s\S]*?y="([\s\S]*?)"/);
			const rx = SSvg.findValue(r, /<rect[\s\S]*?rx="([\s\S]*?)"/);
			// console.log(width, height, x, y, rx);
			rects.push({
				props: {
					width,
					height,
					x,
					y,
					rx,
				},
				bounds: {
					left: x,
					top: y,
					right: x + width,
					bottom: y + height,
				},
			});
		}
		const polygons = [];
		const regPolygons = /<polygon[\s\S]*?<\/polygon>/gm;
		let polygon;
		while (polygon = regPolygons.exec(String(svg))) {
			const p = polygon[0];
			const points = SSvg.findPoints(p, /<polygon[\s\S]*?points="([\s\S]*?)"/);
			if (points.length) {
				const bounds = points.reduce((prev, point) => {
					return {
						left: Math.min(point, prev.left),
						top: Math.min(point, prev.top),
						right: Math.max(point, prev.right),
						bottom: Math.max(point, prev.bottom),
					};
				}, {
					left: Number.POSITIVE_INFINITY,
					top: Number.POSITIVE_INFINITY,
					right: Number.NEGATIVE_INFINITY,
					bottom: Number.NEGATIVE_INFINITY
				});
				polygons.push({
					props: {
						points,
					},
					bounds,
				});
			}
		}
		// <polygon points="2.52808989 2.125 150 2.125 150 5.125 2.52808989 5.125"></polygon>
		const svgBounds = paths.concat(circles, rects, polygons).reduce((prev, current) => {
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
		svg = svg.replace(/<circle[\s\S]*?<\/circle>/gm, (match, group1, offset, string) => {
			match = match.replace(/<circle[\s\S]*?cx="([\s\S]*?)"/, (match, group1, offset, string) => {
				const v = (parseFloat(group1) - svgBounds.left).toFixed(6);
				return match.substr(0, match.length - group1.length - 1) + v + '"';
			});
			match = match.replace(/<circle[\s\S]*?cy="([\s\S]*?)"/, (match, group1, offset, string) => {
				const v = (parseFloat(group1) - svgBounds.top).toFixed(6);
				return match.substr(0, match.length - group1.length - 1) + v + '"';
			});
			return match;
		});
		svg = svg.replace(/<rect[\s\S]*?<\/rect>/gm, (match, group1, offset, string) => {
			match = match.replace(/<rect[\s\S]*?x="([\s\S]*?)"/, (match, group1, offset, string) => {
				const v = (parseFloat(group1) - svgBounds.left).toFixed(6);
				return match.substr(0, match.length - group1.length - 1) + v + '"';
			});
			match = match.replace(/<circle[\s\S]*?y="([\s\S]*?)"/, (match, group1, offset, string) => {
				const v = (parseFloat(group1) - svgBounds.top).toFixed(6);
				return match.substr(0, match.length - group1.length - 1) + v + '"';
			});
			return match;
		});
		svg = svg.replace(/<polygon[\s\S]*?<\/polygon>/gm, (match, group1, offset, string) => {
			match = match.replace(/<polygon[\s\S]*?points="([\s\S]*?)"/, (match, group1, offset, string) => {
				const points = group1.split(' ').map(x => parseFloat(x));
				points.map((v, i) => {
					const n = (i % 2) ? v - svgBounds.top : v - svgBounds.left;
					return parseFloat(n.toFixed(6));
				});
				return match.substr(0, match.length - group1.length - 1) + points.join(' ') + '"';
			});
			return match;
		});
		// console.log(svg);
		return svg;
	}

	static pathRebound(path) {
		const commands = SSvg.pathToCommands(path);
		const bounds = SSvg.commandsToBounds(commands);
		// console.log('pathRebound', bounds);
		return path;
	}

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
			attributes.width = `100%`;
			attributes.viewBox = `0 0 ${this.rect.width} ${this.rect.height}`;
			if (SOptions.svg.sprite) {
				return svg('svg', attributes,
					svg('use', {
						'xmlns:xlink': 'http://www.w3.org/1999/xlink',
						'xlink:href': `#${this.fileName}`
					}));
			} else {
				attributes.src = SSvg.filePath(this.fileName);
				return new VNode('img', attributes, []);
			}
		}
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
