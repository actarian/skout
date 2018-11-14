/* jshint esversion: 6 */

/**
 * @license
 * Copyright Luca Zampetti. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/actarian/skout/blob/master/LICENSE
 */

export default class Component extends HTMLElement {

	static get observedAttributes() {
		return [];
	}

	constructor() {
		super();
		this.root = Component.getShadowRoot.call(this);
		Component.setAttributesChangeCallback.call(this);
	}

	attributeChangedCallback(attribute, oldValue, newValue) {
		if (newValue !== oldValue) {
			// console.log('attributeChangedCallback', attribute, oldValue, newValue);
			Component.setAttributeValue(this.root, attribute, newValue);
		}
	}

	static setAttributeValue(root, attribute, value) {
		if (value) {
			try {
				const data = JSON.parse(value);
				Object.keys(data).forEach(k => {
					const v = data[k];
					if (typeof v == 'string') {
						const span = root.querySelector(`.${k}>span`);
						if (span) {
							span.innerHTML = data[k];
						} else {
							const component = root.querySelector(`.${k}`);
							const tagName = `${v}-component`;
							if (component && component.tagName !== tagName) {
								const newComponent = document.createElement(tagName);
								if (component.hasAttributes()) {
									const attributes = Array.prototype.slice.call(component.attributes);
									attributes.forEach(a => newComponent.setAttribute(a.name, a.value));
								}
								component.replaceWith(newComponent);
							}
						}
					} else if (v) {
						const component = root.querySelector(`.${k}`);
						component.data = v;
					}
				});
			} catch (error) {
				console.log('Component.data.error', error);
			}
		}
	}

	static appendStyle(root, styleText) {
		const style = document.createElement('style');
		style.innerHTML = styleText;
		root.appendChild(style);
	}

	static appendTemplate(root, templateText) {
		const template = document.createRange().createContextualFragment(templateText);
		root.appendChild(template);
		this.constructor.observedAttributes.forEach(attribute => {
			Component.setAttributeValue(root, attribute, this[attribute]);
		});
	}

	static getShadowRoot() {
		// initialize shadow root style & template
		const shadowRoot = this.attachShadow({
			mode: 'closed',
		});
		if (this.constructor.style) {
			Component.appendStyle.apply(this, [shadowRoot, this.constructor.style]);
		} else if (this.constructor.styleUrl) {
			Component.fetchText(this.constructor.styleUrl, (styleText) => {
				// caching
				this.constructor.style = styleText;
				Component.appendStyle.apply(this, [shadowRoot, styleText]);
			});
		}

		if (this.constructor.template) {
			Component.appendTemplate.apply(this, [shadowRoot, this.constructor.template]);
		} else if (this.constructor.templateUrl) {
			Component.fetchText(this.constructor.templateUrl, (templateText) => {
				// caching
				this.constructor.template = templateText;
				Component.appendTemplate.apply(this, [shadowRoot, templateText]);
			});
		}

		return shadowRoot;
	}

	static fetchText(url, success = null, error = null) {
		fetch(url)
			.then(x => x.text())
			.then(text => {
				// console.log('fetch', text);
				if (typeof success == 'function') {
					success(text);
				}
			}).catch(error => {
				// console.log('fetch.error', error);
				if (typeof error == 'function') {
					error(error);
				}
			});
	}

	static setAttributesChangeCallback() {
		// define properties getter & setter
		this.constructor.observedAttributes.forEach(attribute => {
			Object.defineProperty(this, attribute, {
				get: () => {
					return this.getAttribute(attribute);
				},
				set: (value) => {
					if (value) {
						this.setAttribute(attribute, value);
					} else {
						this.removeAttribute(attribute);
					}
				}
			});
		});
	}

}
