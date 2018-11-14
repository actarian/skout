/* jshint esversion: 6 */

import Component from '../component.js';

class CrosshairComponent extends Component {

    static get style() {
        return `
:host>.crosshair {
	display: block;
	position: relative;
	width: 24px;
	height: 24px;
	z-index: 0;
}
`;
    }

    static get template() {
        return `
<link rel="stylesheet" type="text/css" href="css/shared.css"><img class="crosshair" src="svg/crosshair.svg">
`;
    }

    static get observedAttributes() {
        return ['data']; // [];
    }

}

window.customElements.define('crosshair-component', CrosshairComponent);