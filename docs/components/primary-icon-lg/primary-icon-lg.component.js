/* jshint esversion: 6 */

import Component from '../component.js';

class PrimaryIconLgComponent extends Component {

    static get style() {
        return `
:host>.label-icon-left {
	display: block;
	position: absolute;
	width: 83px;
	height: 24px;
	z-index: 1;
	top: 13px;
	left: 34px;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css">
<label-icon-left-component class="label-icon-left" data="{&quot;label&quot;:{},&quot;icon&quot;:&quot;whatsapp&quot;}"></label-icon-left-component>
`;
    }

    static get observedAttributes() {
        return ['data']; // ['label-icon-left'];
    }

}

window.customElements.define('primary-icon-lg-component', PrimaryIconLgComponent);